using System.Text.Json;
using backend.Data;
using backend.Models.RestockModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Dtos.RestockModel;
using backend.Models.LineItems;
using backend.Models.Unit;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/restock/")]
    public class AddRestock : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public AddRestock(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RestockDTO payload)
        {
            if (payload == null) return BadRequest("Payload required");

            // Console.WriteLine("Create payload: {0}", JsonSerializer.Serialize(payload));

            // Use a single transaction for the whole operation
            await using var transaction = await _db.Database.BeginTransactionAsync();

            // Validate restock clerk exists (prevent FK constraint failure)
            if (!string.IsNullOrEmpty(payload.Restock_Clerk))
            {
                var clerkExists = await _db.Users.AnyAsync(u => u.Id == payload.Restock_Clerk);
                if (!clerkExists)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Restock clerk with id '{payload.Restock_Clerk}' not found.");
                }
            }

            // 1) Create restock first
            var restockId = await CreateRestock(payload);

            // 2) Determine next batch number for supplier and create batch referencing restock
            var nextBatchNumber = await GetNextBatchNumberAsync(payload.Batch.Supplier_ID, restockId);
            payload.Batch.Batch_Number = nextBatchNumber;
            var batchId = await CreateBatch(payload, restockId);

            // 3) Create line items referencing batch
            var createdLineItems = await CreateLineItems(payload, batchId);

            // 4) Create unit conversions for each line item with conversions
            var createdConversions = await CreateUnitConversions(payload, createdLineItems);

            await transaction.CommitAsync();

            return Ok(new { restockId, batchId, lineItems = createdLineItems, unitConversions = createdConversions });
        }

        private async Task<int> CreateRestock(RestockDTO payload)
        {
            // Generate unique restock number
            var restockNumber = await GenerateRestockNumberAsync();

            var restock = new Restock
            {
                Restock_Number = restockNumber,
                Restock_Clerk = payload.Restock_Clerk,
                Restock_Notes = payload.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Console.WriteLine("\n restock: {0}", JsonSerializer.Serialize(restock));
            _db.Add(restock);
            await _db.SaveChangesAsync();

            return restock.Restock_ID;
        }

        private async Task<int> CreateBatch(RestockDTO payload, int restockId)
        {
            var batch = new RestockBatch
            {
                Restock_ID = restockId,
                Batch_Number = payload.Batch.Batch_Number,
                Supplier_ID = payload.Batch.Supplier_ID,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Console.WriteLine("\nBatch: {0}", JsonSerializer.Serialize(batch));

            _db.Add(batch);
            await _db.SaveChangesAsync();

            return batch.Batch_ID;
        }

        private async Task<List<(int lineItemId, int productId, int baseUomId)>> CreateLineItems(RestockDTO payload, int batchId)
        {
            var createdLineItems = new List<(int lineItemId, int productId, int baseUomId)>();

            // Console.WriteLine("CreateLineItems payload: {0}", JsonSerializer.Serialize(payload));
            // Console.WriteLine($"Associated batchId: {batchId}");

            for (int i = 0; i < payload.LineItem.Count; i++)
            {
                var dto = payload.LineItem[i];

                var lineItem = new RestockLineItems
                {
                    Product_ID = dto.item.product.Product_ID,
                    Batch_ID = batchId,
                    Base_UOM_ID = dto.uom_ID,
                    Base_Unit_Price = dto.unit_price,
                    Base_Unit_Quantity = dto.unit_quantity
                };

                // Console.WriteLine("LineItem: {0}", JsonSerializer.Serialize(lineItem));

                _db.Add(lineItem);
                await _db.SaveChangesAsync();

                createdLineItems.Add((lineItem.LineItem_ID, dto.item.product.Product_ID, dto.uom_ID));
            }

            return createdLineItems;
        }


        private async Task<int> GetNextBatchNumberAsync(string supplierId, int restockId)
        {
            if (string.IsNullOrEmpty(supplierId)) return 1;

            var max = await _db.RestockBatches
                .Where(b => b.Supplier_ID == supplierId)
                .MaxAsync(b => (int?)b.Batch_Number);

            return (max ?? 0) + 1;
        }

        private async Task<string> GenerateRestockNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"RS-{year}-";

            var maxNumber = await _db.Restocks
                .Where(r => r.Restock_Number.StartsWith(prefix))
                .Select(r => r.Restock_Number)
                .ToListAsync();

            int nextNumber = 1;
            if (maxNumber.Any())
            {
                var numbers = maxNumber
                    .Select(n => int.TryParse(n.Replace(prefix, ""), out int num) ? num : 0)
                    .Where(n => n > 0)
                    .ToList();

                if (numbers.Any())
                    nextNumber = numbers.Max() + 1;
            }

            return $"{prefix}{nextNumber:D3}"; // e.g., RS-2025-001
        }

        private async Task<List<object>> CreateUnitConversions(RestockDTO payload, List<(int lineItemId, int productId, int baseUomId)> createdLineItems)
        {
            var createdConversions = new List<object>();

            for (int i = 0; i < payload.LineItem.Count; i++)
            {
                var lineItem = payload.LineItem[i];
                if (lineItem.unitConversions == null || !lineItem.unitConversions.Any())
                    continue;

                var (lineItemId, productId, baseUomId) = createdLineItems[i];

                // Get UOM IDs from the UnitOfMeasure table
                var unitNames = lineItem.unitConversions
                    .SelectMany(c => new[] { c.FromUnit, c.ToUnit })
                    .Distinct()
                    .ToList();

                var uomMap = await _db.UnitOfMeasure
                    .Where(u => unitNames.Contains(u.uom_Name))
                    .ToDictionaryAsync(u => u.uom_Name, u => u.uom_ID);

                // Start with the base UOM_ID as the parent for the first conversion
                int? parentUomId = baseUomId;

                foreach (var conversion in lineItem.unitConversions)
                {
                    if (!uomMap.ContainsKey(conversion.FromUnit) || !uomMap.ContainsKey(conversion.ToUnit))
                    {
                        // Console.WriteLine($"Warning: Unit '{conversion.FromUnit}' or '{conversion.ToUnit}' not found in UnitOfMeasure table");
                        continue;
                    }

                    var toUomId = uomMap[conversion.ToUnit];

                    var productUom = new Product_UOM
                    {
                        LineItem_ID = lineItemId,
                        UOM_ID = toUomId, // The target unit of this conversion
                        Parent_UOM_ID = parentUomId, // Link to parent UOM
                        Conversion_Factor = conversion.ConversionFactor,
                        Unit_Price = conversion.Price
                    };

                    _db.Add(productUom);
                    await _db.SaveChangesAsync();

                    createdConversions.Add(new
                    {
                        productUomId = productUom.Product_UOM_Id,
                        lineItemId = lineItemId,
                        fromUnit = conversion.FromUnit,
                        toUnit = conversion.ToUnit,
                        conversionFactor = conversion.ConversionFactor,
                        price = conversion.Price
                    });

                    // Set the current UOM as the parent for the next conversion in the chain
                    parentUomId = toUomId;

                    // Console.WriteLine($"Created Product_UOM: {JsonSerializer.Serialize(productUom)}");
                }
            }

            return createdConversions;
        }
    }
}
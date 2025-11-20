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

            Console.WriteLine("Create payload: {0}", JsonSerializer.Serialize(payload));

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





            // 1) determine next batch number for supplier and create batch
            var nextBatchNumber = await GetNextBatchNumberAsync(payload.Batch.Supplier_ID);
            payload.Batch.Batch_Number = nextBatchNumber;
            var batchId = await CreateBatch(payload);

            // 2) create restock referencing batch
            var restockId = await CreateRestock(payload, batchId);

            // 3) create line items referencing restockId
            var createdLineItems = await CreateLineItems(payload, restockId);

            // 4) create unit conversions for each line item with conversions
            var createdConversions = await CreateUnitConversions(payload, batchId);

            await transaction.CommitAsync();

            return Ok(new { restockId, batchId, lineItems = createdLineItems, unitConversions = createdConversions });




            // return Ok();

        }

        private async Task<int> CreateRestock(RestockDTO payload, int batchId)
        {
            decimal totalLineItems = 0;
            foreach (var item in payload.LineItem)
                totalLineItems += item.unit_price * item.unit_quantity;

            Console.WriteLine("\n total_LineItem: {0}", JsonSerializer.Serialize(totalLineItems));

            var restock = new Restock
            {
                Batch_ID = batchId,
                Restock_Clerk = payload.Restock_Clerk,
                Notes = payload.Notes,
                LineItems_Total = totalLineItems
            };

            Console.WriteLine("\n restock: {0}", JsonSerializer.Serialize(restock));
            _db.Add(restock);
            await _db.SaveChangesAsync();

            return restock.Restock_ID;
        }

        private async Task<int> CreateBatch(RestockDTO payload)
        {
            var batch = new RestockBatch
            {
                // TODO: create auto-increment for Batch_Number per Supplier if desired
                Batch_Number = payload.Batch.Batch_Number,
                Supplier_ID = payload.Batch.Supplier_ID,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            Console.WriteLine("\nBatch: {0}", JsonSerializer.Serialize(batch));

            _db.Add(batch);
            await _db.SaveChangesAsync();

            return batch.Batch_ID;
        }

        private async Task<List<object>> CreateLineItems(RestockDTO payload, int restockId)
        {
            var createdLineItems = new List<object>();

            // Serialize the payload and the associated restock ID so the console shows detailed contents
            Console.WriteLine("CreateLineItems payload: {0}", JsonSerializer.Serialize(payload));
            Console.WriteLine($"Associated restockId: {restockId}");

            for (int i = 0; i < payload.LineItem.Count; i++)
            {
                var dto = payload.LineItem[i];

                var lineItem = new RestockLineItems
                {
                    Product_ID = dto.item.product.Product_ID,
                    Restock_ID = restockId,
                    uom_ID = dto.uom_ID,
                    Unit_Price = dto.unit_price,
                    Sub_Total = dto.unit_price * dto.unit_quantity,
                    Quantity = dto.unit_quantity
                };

                Console.WriteLine("LineItem: {0}", JsonSerializer.Serialize(lineItem));

                _db.Add(lineItem);
                await _db.SaveChangesAsync();

                createdLineItems.Add(new { lineItemId = lineItem.LineItem_ID, restockId = restockId });
            }

            return createdLineItems;
        }


        private async Task<int> GetNextBatchNumberAsync(string supplierId)
        {
            if (string.IsNullOrEmpty(supplierId)) return 1;

            var max = await _db.RestocksBatch
                .Where(b => b.Supplier_ID == supplierId)
                .MaxAsync(b => (int?)b.Batch_Number);

            return (max ?? 0) + 1;
        }

        private async Task<List<object>> CreateUnitConversions(RestockDTO payload, int batchId)
        {
            var createdConversions = new List<object>();

            foreach (var lineItem in payload.LineItem)
            {
                if (lineItem.unitConversions == null || !lineItem.unitConversions.Any())
                    continue;

                var productId = lineItem.item.product.Product_ID;

                // Get UOM IDs from the UnitOfMeasure table
                var unitNames = lineItem.unitConversions
                    .SelectMany(c => new[] { c.FromUnit, c.ToUnit })
                    .Distinct()
                    .ToList();

                var uomMap = await _db.UnitOfMeasure
                    .Where(u => unitNames.Contains(u.uom_Name))
                    .ToDictionaryAsync(u => u.uom_Name, u => u.uom_ID);

                // Parent_UOM_Id will be 0 for the first conversion, then each subsequent conversion
                // references the previous toUnit as its parent
                int parentUomId = 0;

                foreach (var conversion in lineItem.unitConversions)
                {
                    if (!uomMap.ContainsKey(conversion.FromUnit) || !uomMap.ContainsKey(conversion.ToUnit))
                    {
                        Console.WriteLine($"Warning: Unit '{conversion.FromUnit}' or '{conversion.ToUnit}' not found in UnitOfMeasure table");
                        continue;
                    }

                    var fromUomId = uomMap[conversion.FromUnit];
                    var toUomId = uomMap[conversion.ToUnit];

                    var productUom = new Product_UOM
                    {
                        Product_Id = productId,
                        Batch_Id = batchId,
                        UOM_Id = toUomId, // The target unit of this conversion
                        Parent_UOM_Id = parentUomId == 0 ? fromUomId : parentUomId, // Link to parent unit
                        Conversion_Factor = conversion.ConversionFactor,
                        Price = conversion.Price
                    };

                    _db.Add(productUom);
                    await _db.SaveChangesAsync();

                    createdConversions.Add(new
                    {
                        productUomId = productUom.Product_UOM_Id,
                        productId = productId,
                        batchId = batchId,
                        fromUnit = conversion.FromUnit,
                        toUnit = conversion.ToUnit,
                        conversionFactor = conversion.ConversionFactor,
                        quantity = conversion.Quantity,
                        price = conversion.Price
                    });

                    // Set the current toUnit as the parent for the next conversion in the chain
                    parentUomId = toUomId;

                    Console.WriteLine($"Created Product_UOM: {JsonSerializer.Serialize(productUom)}");
                }
            }

            return createdConversions;
        }
    }
}
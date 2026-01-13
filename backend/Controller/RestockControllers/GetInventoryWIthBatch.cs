using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.RestockControllers
{
    [ApiController]
    [Route("api/inventory-with-batches")]
    public class GetInventoryWIthBatch : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetInventoryWIthBatch(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var results = await _db.Inventory
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Variant)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Brand)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.Category)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.ProductPresets)
                            .ThenInclude(pp => pp.Preset)
                                .ThenInclude(preset => preset.PresetLevels)
                                    .ThenInclude(level => level.UnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.RestockBatch)
                                .ThenInclude(rb => rb.Supplier)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.RestockBatch)
                                .ThenInclude(rb => rb.Restock)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.BaseUnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.ProductUOMs)
                                .ThenInclude(puom => puom.UnitOfMeasure)
                    .Include(i => i.Product)
                        .ThenInclude(p => p.RestockLineItems)
                            .ThenInclude(rli => rli.ProductUOMs)
                                .ThenInclude(puom => puom.ParentUnitOfMeasure)
                    .Select(i => new
                    {
                        Product = new
                        {
                            i.Product_ID,
                            i.Product.Product_Code,
                            i.Product.Product_Name,
                            i.Product.Description,
                            CreatedAt = i.Created_At,
                            UpdatedAt = i.Updated_At
                        },
                        Variant = new
                        {
                            i.Product.Variant.Variant_ID,
                            i.Product.Variant.Variant_Name,
                            i.Product.Variant.CreatedAt,
                            i.Product.Variant.UpdatedAt
                        },
                        Brand = new
                        {
                            i.Product.Brand.Brand_ID,
                            i.Product.Brand.BrandName,
                            i.Product.Brand.CreatedAt,
                            i.Product.Brand.UpdatedAt
                        },
                        Category = new
                        {
                            i.Product.Category.Category_ID,
                            i.Product.Category.Category_Name,
                            i.Product.Category.CreatedAt,
                            i.Product.Category.UpdatedAt
                        },
                        UnitPresets = i.Product.ProductPresets.Select(pp => new
                        {
                            pp.Product_Preset_ID,
                            pp.Preset_ID,
                            pp.Assigned_At,
                            pp.Low_Stock_Level,
                            pp.Very_Low_Stock_Level,
                            Preset = new
                            {
                                pp.Preset.Preset_ID,
                                pp.Preset.Preset_Name,
                                pp.Preset.Main_Unit_ID,
                                pp.Preset.Created_At,
                                pp.Preset.Updated_At,
                                PresetLevels = pp.Preset.PresetLevels.Select(level => new
                                {
                                    level.Level_ID,
                                    level.UOM_ID,
                                    level.Level,
                                    level.Conversion_Factor,
                                    level.Created_At,
                                    UnitOfMeasure = new
                                    {
                                        level.UnitOfMeasure.uom_ID,
                                        level.UnitOfMeasure.uom_Name
                                    }
                                }).OrderBy(l => l.Level).ToList()
                            }
                        }).ToList(),

                        // RestockInfo = _db.RestockLineItems
                        //         .Where(rli => rli.Product_ID == i.Product_ID)
                        //         .Include(rli => rli.RestockBatch)
                        //         .ThenInclude(rb => rb.Restock)
                        //         .ThenInclude(r => r.Clerk)
                        //         .Include(rli => rli.RestockBatch)
                        //         .ThenInclude(rb => rb.Supplier)
                        //         .Select(rli => new
                        //         {
                        //             RestockId = rli.RestockBatch.Restock_ID,
                        //             RestockNumber = rli.RestockBatch.Restock.Restock_Number,
                        //             Clerk = rli.RestockBatch.Restock.Clerk != null ? new
                        //             {
                        //                 rli.RestockBatch.Restock.Clerk.Id,
                        //                 rli.RestockBatch.Restock.Clerk.FirstName,
                        //                 rli.RestockBatch.Restock.Clerk.LastName
                        //             } : null,
                        //             BatchId = rli.Batch_ID,
                        //             BatchNumber = rli.RestockBatch.Batch_Number,
                        //             Supplier = rli.RestockBatch.Supplier != null ? new
                        //             {
                        //                 rli.RestockBatch.Supplier.Id,
                        //                 rli.RestockBatch.Supplier.FirstName,
                        //                 rli.RestockBatch.Supplier.LastName,
                        //                 rli.RestockBatch.Supplier.CompanyName
                        //             } : null,
                        //             rli.Base_Unit_Price,
                        //             rli.Base_Unit_Quantity
                        //         })
                        //         .ToList(),

                        // IsComplete = i.Product.ProductPresets.Any()
                    }).ToListAsync();

                if (results == null || !results.Any())
                {
                    return NotFound("No inventory products found.");
                }

                return Ok(results);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
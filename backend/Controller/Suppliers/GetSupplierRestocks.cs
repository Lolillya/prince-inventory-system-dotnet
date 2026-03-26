using backend.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controller.Suppliers
{
    [ApiController]
    [Route("api/suppliers")]
    public class GetSupplierRestocks : ControllerBase
    {
        private readonly ApplicationDBContext _db;

        public GetSupplierRestocks(ApplicationDBContext db)
        {
            _db = db;
        }

        [HttpGet("restocks")]
        public async Task<IActionResult> GetSuppliersWithRestocks()
        {
            try
            {
                // Get all user IDs assigned to the Supplier role.
                var supplierIds = await (
                    from userRole in _db.Set<IdentityUserRole<string>>()
                    join role in _db.Roles on userRole.RoleId equals role.Id
                    where role.NormalizedName == "SUPPLIER"
                    select userRole.UserId
                )
                    .Distinct()
                    .ToListAsync();

                // Get suppliers with their restock batches and line items
                var suppliers = await _db.Users
                    .Where(u => supplierIds.Contains(u.Id))
                    .Select(supplier => new
                    {
                        supplier_Id = supplier.Id,
                        first_Name = supplier.FirstName,
                        last_Name = supplier.LastName,
                        company_Name = supplier.CompanyName,
                        email = supplier.Email,
                        phone_Number = supplier.PhoneNumber,
                        address = supplier.Address,
                        notes = supplier.Notes,
                        username = supplier.UserName,

                        restocks = _db.RestockBatches
                            .Where(rb => rb.Supplier_ID == supplier.Id)
                            .Select(rb => new
                            {
                                batch_Id = rb.Batch_ID,
                                batch_Number = rb.Batch_Number,
                                restock_Id = rb.Restock_ID,
                                created_At = rb.CreatedAt,
                                updated_At = rb.UpdatedAt,

                                restock_Info = new
                                {
                                    rb.Restock.Restock_ID,
                                    rb.Restock.Restock_Number,
                                    rb.Restock.Restock_Notes,
                                    rb.Restock.Status,
                                    rb.Restock.CreatedAt,
                                    rb.Restock.UpdatedAt,
                                },

                                line_Items = rb.RestockLineItems.Select(rli => new
                                {
                                    line_Item_ID = rli.LineItem_ID,
                                    product_ID = rli.Product_ID,
                                    base_UOM_ID = rli.Base_UOM_ID,
                                    preset_ID = rli.Preset_ID,
                                    base_Unit_Price = rli.Base_Unit_Price,
                                    base_Unit_Quantity = rli.Base_Unit_Quantity,
                                    line_Item_Total = rli.Base_Unit_Price * rli.Base_Unit_Quantity,

                                    product = rli.Product != null ? new
                                    {
                                        rli.Product.Product_ID,
                                        rli.Product.Product_Code,
                                        rli.Product.Product_Name,
                                        rli.Product.Description,
                                        brand = rli.Product.Brand != null ? new
                                        {
                                            rli.Product.Brand.Brand_ID,
                                            rli.Product.Brand.BrandName
                                        } : null,
                                        category = rli.Product.Category != null ? new
                                        {
                                            rli.Product.Category.Category_ID,
                                            rli.Product.Category.Category_Name
                                        } : null,
                                        variant = rli.Product.Variant != null ? new
                                        {
                                            rli.Product.Variant.Variant_ID,
                                            rli.Product.Variant.Variant_Name
                                        } : null
                                    } : null,

                                    unit_Preset = rli.UnitPreset != null ? new
                                    {
                                        rli.UnitPreset.Preset_ID,
                                        rli.UnitPreset.Preset_Name,
                                        rli.UnitPreset.Main_Unit_ID,
                                        main_Unit = rli.UnitPreset.MainUnit != null ? new
                                        {
                                            rli.UnitPreset.MainUnit.uom_ID,
                                            rli.UnitPreset.MainUnit.uom_Name
                                        } : null,
                                        preset_Levels = rli.UnitPreset.PresetLevels
                                            .OrderBy(pl => pl.Level)
                                            .Select(pl => new
                                            {
                                                pl.Level_ID,
                                                pl.Level,
                                                pl.UOM_ID,
                                                pl.Conversion_Factor,
                                                unit = pl.UnitOfMeasure != null ? new
                                                {
                                                    pl.UnitOfMeasure.uom_ID,
                                                    pl.UnitOfMeasure.uom_Name
                                                } : null
                                            })
                                            .ToList()
                                    } : null,

                                    preset_Pricing = rli.PresetPricing.Select(pp => new
                                    {
                                        pp.Pricing_ID,
                                        pp.UOM_ID,
                                        Price_Per_Unit = pp.Price_Per_Unit > 0
                                            ? pp.Price_Per_Unit
                                            : (_db.Product_Unit_Preset_Pricing
                                                .Where(pupPricing =>
                                                    pupPricing.UOM_ID == pp.UOM_ID
                                                    && pupPricing.Level == pp.Level
                                                    && pupPricing.ProductUnitPreset.Product_ID == rli.Product_ID
                                                    && pupPricing.ProductUnitPreset.Preset_ID == rli.Preset_ID)
                                                .Select(pupPricing => (decimal?)pupPricing.Price_Per_Unit)
                                                .FirstOrDefault() ?? 0),
                                        unit = pp.UnitOfMeasure != null ? new
                                        {
                                            pp.UnitOfMeasure.uom_ID,
                                            pp.UnitOfMeasure.uom_Name
                                        } : null
                                    }).ToList()
                                }).ToList(),

                            })
                            .ToList(),


                    })
                    .ToListAsync();

                return Ok(suppliers);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }


    }
}
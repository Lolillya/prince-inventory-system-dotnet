# Unit Preset Restock Implementation - Migration Guide

## Overview

This implementation adds support for unit preset-based restocking, allowing users to:

1. Select products with associated unit presets
2. Choose a specific unit preset for restocking
3. Enter quantity in the main unit (Level 1)
4. Specify pricing for each unit level in the preset hierarchy

## Database Migration Required

### New Table: RestockLineItem_PresetPricing

```bash
cd backend
dotnet ef migrations add AddRestockLineItemPresetPricing
dotnet ef database update
```

### Schema Changes:

- **RestockLineItems**: Added `Preset_ID` (nullable), `PresetPricing` navigation property
- **New Table**: `RestockLineItem_PresetPricing` for storing pricing per unit level

## Backend Changes

### New Files Created:

1. **DTOs**:

   - `/backend/Dtos/RestockModel/UnitPresetRestockDTO.cs`
     - Models for the new API endpoint

2. **Models**:

   - `/backend/Models/LineItems/RestockLineItem_PresetPricing.cs`
     - Stores pricing for each unit level

3. **Controllers**:
   - `/backend/Controller/RestockControllers/CreateUnitPresetRestockController.cs`
     - New endpoint: `POST /api/restock/unit-preset`

### Modified Files:

1. `/backend/Models/LineItems/RestockLineItems.cs`

   - Added `Preset_ID` (nullable)
   - Added `UnitPreset` navigation property
   - Added `PresetPricing` collection

2. `/backend/Data/ApplicationDBContext.cs`

   - Added `DbSet<RestockLineItem_PresetPricing>`

3. `/backend/Controller/RestockControllers/GetInventoryWIthBatch.cs`
   - Updated to include unit preset data with mainUnit

## Frontend Changes

### New Files Created:

1. **Models**:

   - `/frontend/src/features/restock/models/unit-preset-restock.model.ts`
     - TypeScript interfaces for unit preset restock

2. **State Management**:

   - `/frontend/src/features/restock/unit-preset-restock.store.ts`
     - Zustand store for managing restock items with presets

3. **Services**:
   - `/frontend/src/features/restock/unit-preset-restock.service.ts`
     - API service for creating preset-based restocks

### Modified Files:

1. `/frontend/src/pages/admin/restock/new-restock/_components/restock-card-copy.tsx`

   - Implements preset selection
   - Conditional rendering of quantity and pricing inputs
   - State management integration

2. `/frontend/src/pages/admin/restock/new-restock/index.tsx`

   - Updated to use new store
   - Simplified product handling

3. `/frontend/src/pages/admin/restock/new-restock/_components/restock-modal-table.tsx`

   - Updated to display preset information
   - Calculate totals based on preset pricing
   - Calls new API endpoint

4. `/frontend/src/features/restock/models/inventory-batches.model.ts`
   - Updated to include mainUnit data with abbreviation

## API Endpoints

### New Endpoint

**POST** `/api/restock/unit-preset`

**Payload**:

```json
{
  "lineItems": [
    {
      "product_ID": 1,
      "preset_ID": 1,
      "main_Unit_Quantity": 100,
      "levelPricing": [
        {
          "level": 1,
          "uom_ID": 5,
          "price_Per_Unit": 1000.0
        },
        {
          "level": 2,
          "uom_ID": 3,
          "price_Per_Unit": 100.0
        },
        {
          "level": 3,
          "uom_ID": 1,
          "price_Per_Unit": 10.0
        }
      ]
    }
  ],
  "supplier_ID": "supplier-guid",
  "restock_Clerk": "clerk-guid",
  "notes": "Optional notes"
}
```

**Response**:

```json
{
  "message": "Restock created successfully",
  "restock_Number": "RS-2026-000001",
  "restock_ID": 1
}
```

### Updated Endpoint

**GET** `/api/inventory-with-batches`

- Now includes full unit preset data with mainUnit information

## User Flow

1. **Select Product**: User clicks a product from the inventory list
2. **Choose Preset**: User selects a unit preset from the dropdown (e.g., "Box → Cases → Pieces")
3. **Enter Quantity**: Input field appears for quantity in the main unit (e.g., "Add stock (Box)")
4. **Set Prices**: Input fields appear for each unit level in the preset
5. **Review**: Modal shows all items with preset information
6. **Save**: Creates restock with preset-based pricing

## Benefits

1. **Flexible Pricing**: Different prices per unit level
2. **Accurate Tracking**: Records which preset was used for each restock
3. **Better Reporting**: Can analyze pricing trends per unit level
4. **Backwards Compatible**: Old restock system still works (Preset_ID is nullable)

## Testing Checklist

- [ ] Run database migration
- [ ] Test GET endpoint returns unit presets with mainUnit
- [ ] Test POST endpoint creates restock with preset pricing
- [ ] Test frontend preset selection
- [ ] Test quantity and price inputs show/hide correctly
- [ ] Test modal displays correct preset information
- [ ] Test total calculations are accurate
- [ ] Test inventory updates correctly after restock

## Notes

- The old restock endpoint (`/api/restock`) is still available for backwards compatibility
- `Preset_ID` in `RestockLineItems` is nullable to support both old and new systems
- All pricing is stored in decimal(18,2) format
- Main unit quantity and pricing are used for inventory updates

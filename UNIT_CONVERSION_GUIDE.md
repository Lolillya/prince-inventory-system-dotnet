# Unit Conversion System

## Overview

The unit conversion system allows multi-level unit conversions for products in the inventory system. For example:

- 1 box → 7 packs
- 1 pack → 10 pieces

This enables tracking inventory at different unit levels and automatic conversion between them.

## Frontend Implementation

### Data Models

**UnitConversion** (`frontend/src/models/unit-conversion.model.ts`)

```typescript
export type UnitConversion = {
  id: string; // Temporary ID for frontend tracking
  fromUnit: string; // Source unit (e.g., "BOXES")
  toUnit: string; // Target unit (e.g., "PACKS")
  conversionFactor: number; // How many toUnits in one fromUnit
};
```

**RestockModel** (updated)

```typescript
export type RestockModel = {
  restock: {
    items: InventoryProductModel;
    unit: string;
    unit_quantity: number;
    unit_price: number;
    total: number;
    unitConversions?: UnitConversion[]; // Array of conversions
  };
};
```

### State Management

The `selected-restock.ts` service provides these functions:

- **ADD_UNIT_CONVERSION**: Add a new conversion to a product
- **UPDATE_UNIT_CONVERSION**: Update an existing conversion (factor, units)
- **REMOVE_UNIT_CONVERSION**: Remove a conversion

### UI Component

**RestockCard** (`frontend/src/pages/admin/restock/new-restock/_components/restock-card.tsx`)

Features:

- Click the **+** icon to add a new unit conversion row
- Each row contains:
  - **From Unit** dropdown (select source unit)
  - **Conversion Factor** input (numeric, e.g., 7)
  - **To Unit** dropdown (select target unit)
  - **X** button to remove the conversion
- Conversions are stored in component state and synced to react-query cache

Example usage:

1. User selects "BOXES" as from unit
2. Enters "7" as conversion factor
3. Selects "PACKS" as to unit
4. Result: 1 BOXES = 7 PACKS

Multiple conversions can be chained:

- Conversion 1: BOXES → 7 PACKS
- Conversion 2: PACKS → 10 PIECES
- Final: 1 BOX = 70 PIECES (calculated by multiplying factors)

## Backend Implementation

### DTOs

**UnitConversionDto** (`backend/Dtos/RestockModel/UnitConversionDto.cs`)

```csharp
public class UnitConversionDto
{
    [Required]
    public string FromUnit { get; set; }

    [Required]
    public string ToUnit { get; set; }

    [Required]
    public int ConversionFactor { get; set; }
}
```

**RestockLineItemPayloadDto** (updated)

- Added `List<UnitConversionDto>? unitConversions` property

### Database Model

**Product_UOM** (`backend/Models/Unit/Product_UOM.cs`)

- Stores conversion factors per product
- Fields:
  - Product_UOM_Id (PK)
  - Product_Id (FK to Product)
  - UOM_Id (FK to UnitOfMeasure)
  - Parent_UOM_Id (for hierarchical conversions)
  - Conversion_Factor

### API Flow

When creating a restock:

1. Frontend sends line items with `unitConversions` array
2. Backend receives the DTO in `AddRestock` controller
3. For each line item with conversions:
   - Create/update Product_UOM entries
   - Store conversion factors in the database
   - Link to the product

## Usage Example

### Frontend Code

```typescript
// Add a conversion: 1 BOX = 7 PACKS
const conversion: UnitConversion = {
  id: "conv-123",
  fromUnit: "BOXES",
  toUnit: "PACKS",
  conversionFactor: 7,
};

ADD_UNIT_CONVERSION(productId, conversion, variantName);
```

### Payload Sent to Backend

```json
{
  "LineItem": [
    {
      "item": { "product": { "Product_ID": 1 }, ... },
      "unit": "BOXES",
      "unit_quantity": 10,
      "unit_price": 100,
      "unitConversions": [
        { "fromUnit": "BOXES", "toUnit": "PACKS", "conversionFactor": 7 },
        { "fromUnit": "PACKS", "toUnit": "PIECES", "conversionFactor": 10 }
      ]
    }
  ],
  ...
}
```

## Next Steps

### Backend TODO:

1. Update `AddRestock` controller to parse `unitConversions` from payload
2. Create service method to persist Product_UOM entries
3. Handle parent-child UOM relationships for hierarchical conversions
4. Add validation for circular conversions

### Frontend TODO:

1. Add visual indicator showing the complete conversion chain
2. Calculate and display the final conversion (e.g., "1 BOX = 70 PIECES")
3. Add validation to prevent duplicate or circular conversions
4. Show conversion hierarchy in a tree/chain view

## Notes

- Conversion factors are integers (whole numbers)
- Conversions are directional (A→B doesn't automatically create B→A)
- Multiple conversions can be chained for multi-level hierarchies
- Each product can have its own set of conversions per variant

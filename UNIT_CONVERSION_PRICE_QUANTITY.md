# Unit Conversion with Price and Quantity - Implementation Summary

## Overview

Updated the unit conversion system to include:

- **Price per unit** at each conversion level
- **Quantity to restock** at each conversion level
- **Batch ID reference** linking each conversion to a specific restock batch

## Updated Structure

### Frontend Changes

#### 1. UnitConversion Model (`frontend/src/models/unit-conversion.model.ts`)

```typescript
export type UnitConversion = {
  id: string; // Temporary ID for frontend tracking
  fromUnit: string; // Source unit (e.g., "BOXES")
  toUnit: string; // Target unit (e.g., "PACKS")
  conversionFactor: number; // How many toUnits in one fromUnit
  quantity: number; // Quantity to be restocked at this level
  price: number; // Price per unit at this level
};
```

#### 2. RestockCard UI (`restock-card.tsx`)

Each conversion row now includes:

- **Stock input**: Quantity to restock at this unit level
- **Price input**: Price per unit at this conversion level
- **From Unit dropdown**: Source unit
- **Conversion Factor**: Number of target units per source unit
- **To Unit dropdown**: Target unit
- **Remove button**: Delete this conversion

#### 3. Create Restock Service (`create-restock.service.ts`)

Maps the unit conversions with quantity and price:

```typescript
unitConversions: p.restock.unitConversions?.map((conv) => ({
  fromUnit: conv.fromUnit,
  toUnit: conv.toUnit,
  conversionFactor: conv.conversionFactor,
  quantity: conv.quantity, // NEW
  price: conv.price, // NEW
})) || [];
```

### Backend Changes

#### 1. UnitConversionDto (`backend/Dtos/RestockModel/UnitConversionDto.cs`)

```csharp
public class UnitConversionDto
{
    [Required]
    public string FromUnit { get; set; }

    [Required]
    public string ToUnit { get; set; }

    [Required]
    public int ConversionFactor { get; set; }

    [Required]
    public int Quantity { get; set; }        // NEW

    [Required]
    public decimal Price { get; set; }       // NEW
}
```

#### 2. Product_UOM Model (Already Exists)

```csharp
public class Product_UOM
{
    [Key]
    public int Product_UOM_Id { get; set; }

    public int Conversion_Factor { get; set; }
    public decimal Price { get; set; }        // Stores price per unit

    // Foreign Keys
    public int Parent_UOM_Id { get; set; }    // Links to parent unit in chain
    public int Batch_Id { get; set; }         // Links to RestockBatch
    public int Product_Id { get; set; }
    public int UOM_Id { get; set; }

    public RestockBatch RestockBatch { get; set; }
    public UnitOfMeasure UnitOfMeasure { get; set; }
    public Product Product { get; set; }
}
```

#### 3. AddRestock Controller - CreateUnitConversions Method

New method that:

1. Iterates through each line item's unit conversions
2. Looks up UOM IDs from unit names
3. Creates Product_UOM entries with:
   - Conversion factor
   - Price
   - Batch ID (links to current restock batch)
   - Parent UOM ID (creates hierarchical chain)
4. Returns created conversion details

## Usage Example

### Scenario: Restocking Paper

You receive:

- 10 boxes at $50/box
- Each box contains 7 packs
- 5 additional packs at $8/pack
- Each pack contains 10 pieces

### Frontend Input:

```
Main Entry:
- Stock: 10
- Price: $50
- Unit: BOXES

Conversion 1:
- Stock: 5
- Price: $8
- From: BOXES → Factor: 7 → To: PACKS

Conversion 2:
- Stock: 0
- Price: $0.50
- From: PACKS → Factor: 10 → To: PIECES
```

### Backend Storage:

**RestockLineItems** (main entry):

- Product_ID: 1
- Quantity: 10
- Unit: BOXES
- Unit_Price: 50
- Batch_ID: 123

**Product_UOM** (conversion 1):

- Product_Id: 1
- Batch_Id: 123
- UOM_Id: 2 (PACKS)
- Parent_UOM_Id: 1 (BOXES)
- Conversion_Factor: 7
- Price: 8

**Product_UOM** (conversion 2):

- Product_Id: 1
- Batch_Id: 123
- UOM_Id: 3 (PIECES)
- Parent_UOM_Id: 2 (PACKS)
- Conversion_Factor: 10
- Price: 0.50

### Calculation:

- 10 BOXES = 10 × 7 = 70 PACKS
- 70 PACKS + 5 PACKS = 75 PACKS total
- 75 PACKS = 75 × 10 = 750 PIECES

Total value:

- Boxes: 10 × $50 = $500
- Extra packs: 5 × $8 = $40
- **Total: $540**

## Database Schema

### Product_UOM Table Structure

```sql
Product_UOM
├── Product_UOM_Id (PK)
├── Product_Id (FK → Products)
├── Batch_Id (FK → RestockBatch)
├── UOM_Id (FK → UnitOfMeasure)
├── Parent_UOM_Id (FK → UnitOfMeasure, parent in chain)
├── Conversion_Factor (int)
└── Price (decimal)
```

### Hierarchical Chain Example

```
BOXES (Parent_UOM_Id = BOXES)
  └── PACKS (Parent_UOM_Id = BOXES, Factor = 7)
        └── PIECES (Parent_UOM_Id = PACKS, Factor = 10)
```

## API Flow

### Request (POST /api/restock/):

```json
{
  "LineItem": [
    {
      "item": { "product": { "Product_ID": 1 }, ... },
      "unit": "BOXES",
      "unit_quantity": 10,
      "unit_price": 50,
      "unitConversions": [
        {
          "fromUnit": "BOXES",
          "toUnit": "PACKS",
          "conversionFactor": 7,
          "quantity": 5,
          "price": 8
        },
        {
          "fromUnit": "PACKS",
          "toUnit": "PIECES",
          "conversionFactor": 10,
          "quantity": 0,
          "price": 0.50
        }
      ]
    }
  ],
  "Batch": { "Supplier_ID": "supplier-123" },
  "Restock_Clerk": "clerk-456",
  "Notes": "Monthly restock"
}
```

### Response:

```json
{
  "restockId": 789,
  "batchId": 123,
  "lineItems": [...],
  "unitConversions": [
    {
      "productUomId": 1,
      "productId": 1,
      "batchId": 123,
      "fromUnit": "BOXES",
      "toUnit": "PACKS",
      "conversionFactor": 7,
      "quantity": 5,
      "price": 8
    },
    {
      "productUomId": 2,
      "productId": 1,
      "batchId": 123,
      "fromUnit": "PACKS",
      "toUnit": "PIECES",
      "conversionFactor": 10,
      "quantity": 0,
      "price": 0.50
    }
  ]
}
```

## Benefits

1. **Flexible Pricing**: Different prices at different unit levels
2. **Mixed Unit Restocking**: Add stock at any conversion level
3. **Batch Tracking**: Each conversion links to a specific restock batch
4. **Hierarchical Chain**: Parent_UOM_Id creates proper unit hierarchy
5. **Audit Trail**: Full history of conversions per batch

## Next Steps

1. **Inventory Calculation**: Use Product_UOM to calculate total pieces
2. **Price Analysis**: Report on price per lowest unit
3. **Conversion Query API**: Get all conversions for a product
4. **UI Enhancement**: Show total calculated pieces/value
5. **Validation**: Prevent circular conversions

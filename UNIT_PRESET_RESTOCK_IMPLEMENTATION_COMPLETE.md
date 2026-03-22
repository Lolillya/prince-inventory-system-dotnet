# Unit Preset Restock Implementation - Complete Guide

## Overview

This document describes the enhanced restock feature that supports unit presets. The system now properly updates all related tables when creating a restock record.

## API Endpoint

**POST** `/api/restock/unit-preset`

### Request Payload Structure

```json
{
  "lineItems": [
    {
      "product_ID": 1,
      "preset_ID": 5,
      "main_Unit_Quantity": 100,
      "levelPricing": [
        {
          "level": 1,
          "uom_ID": 10,
          "price_Per_Unit": 25.5
        },
        {
          "level": 2,
          "uom_ID": 11,
          "price_Per_Unit": 250.0
        }
      ]
    }
  ],
  "supplier_ID": "SUP-001",
  "restock_Clerk": "USER-123",
  "notes": "Quarterly restock from primary supplier"
}
```

### Request DTO

The endpoint uses `UnitPresetRestockDTO` which contains:

- `LineItems`: List of products to restock with their preset configurations
- `Supplier_ID`: ID of the supplier providing the stock
- `Restock_Clerk`: ID of the user creating the restock
- `Notes`: Optional notes about the restock

## Database Operations Flow

The endpoint performs the following operations in a **database transaction**:

### 1. Create Restock Record

- Generates a unique restock number: `RS-YYYY-NNNNNN`
- Stores clerk information and notes
- **Table Updated**: `Restock`

### 2. Create Restock Batch

- Links to the created Restock record
- Associates the supplier
- Sets batch number (for multiple batches from different suppliers)
- **Table Updated**: `RestockBatch`

### 3. Process Each Line Item

For each product in the restock:

#### a) Create Restock Line Item

- Links product to the restock batch
- Stores the preset ID being used
- Records base unit (Level 1) information:
  - Base UOM ID
  - Base unit quantity
  - Base unit price
- **Table Updated**: `RestockLineItems`

#### b) Store Level Pricing

- Creates pricing records for each level in the preset hierarchy
- Stores price per unit for each conversion level
- **Table Updated**: `RestockLineItem_PresetPricing`

#### c) Update Inventory

- Increases `Total_Quantity` by the restocked amount
- Creates new inventory record if product doesn't exist
- **Table Updated**: `Inventory`

#### d) **[NEW]** Update Product Unit Preset

- Increases `Main_Unit_Quantity` by the restocked amount
- Tracks total quantity for this specific preset configuration
- **Table Updated**: `Product_Unit_Preset`

#### e) **[NEW]** Update Preset Quantity Levels

- Updates or creates quantity records for EACH level in the preset
- Calculates quantities for higher levels based on conversion factors
- Updates both `Original_Quantity` and `Remaining_Quantity`
- **Table Updated**: `Product_Unit_Preset_Quantity`

### Example: Multi-Level Quantity Calculation

If you restock **100 Boxes** and the preset has:

- Level 1: Box (1:1 ratio)
- Level 2: Case (1:10 ratio - 10 boxes per case)
- Level 3: Pallet (1:5 ratio - 5 cases per pallet)

The system creates/updates:

- **Level 1**: 100 Boxes
- **Level 2**: 10 Cases (100 ÷ 10)
- **Level 3**: 2 Pallets (10 ÷ 5)

## Tables Affected

| Table                           | Operation         | Description                   |
| ------------------------------- | ----------------- | ----------------------------- |
| `Restock`                       | INSERT            | Main restock record           |
| `RestockBatch`                  | INSERT            | Supplier batch record         |
| `RestockLineItems`              | INSERT            | Line item for each product    |
| `RestockLineItem_PresetPricing` | INSERT            | Pricing for each preset level |
| `Inventory`                     | UPDATE/INSERT     | Total product quantity        |
| `Product_Unit_Preset`           | **UPDATE**        | Main unit quantity for preset |
| `Product_Unit_Preset_Quantity`  | **UPDATE/INSERT** | Quantity breakdown by level   |

## Transaction Safety

All operations are wrapped in a database transaction:

- If any operation fails, **all changes are rolled back**
- Ensures data consistency across all tables
- Returns appropriate error messages on failure

## Response

### Success Response (200 OK)

```json
{
  "message": "Restock created successfully",
  "restock_Number": "RS-2026-000001",
  "restock_ID": 1
}
```

### Error Responses

**400 Bad Request** - Invalid data or preset not assigned to product

```json
"Product 5 does not have preset 10"
```

**500 Internal Server Error** - Database or system error

```json
"Error creating restock: [error details]"
```

## Frontend Integration

The frontend payload structure from `restock-modal-table.tsx`:

```typescript
const restockPayload = {
  lineItems: payload.lineItems,
  supplier_ID: supplier.id,
  restock_Clerk: user.user_ID,
  notes: "",
};

createRestock(restockPayload);
```

## Key Features

✅ **Complete Transaction Management**: All-or-nothing approach ensures data integrity

✅ **Multi-Level Quantity Tracking**: Automatically calculates quantities for all preset levels

✅ **Preset-Aware**: Validates that products have the specified presets assigned

✅ **Pricing Flexibility**: Supports different prices for each unit level

✅ **Inventory Synchronization**: Keeps inventory totals in sync with preset quantities

✅ **Supplier Tracking**: Associates restocks with specific suppliers

✅ **Audit Trail**: Tracks clerk, timestamps, and notes for each restock

## Usage Example

### Scenario: Restocking Notebooks

Product: "Notebook 100 pages - Brand A - A4 Size"

- Has Unit Preset: Box → Case → Pallet
- Converting 1 Pallet = 5 Cases = 50 Boxes

**Frontend sends:**

```json
{
  "lineItems": [
    {
      "product_ID": 25,
      "preset_ID": 3,
      "main_Unit_Quantity": 200, // 200 boxes
      "levelPricing": [
        { "level": 1, "uom_ID": 5, "price_Per_Unit": 15.0 }, // Box
        { "level": 2, "uom_ID": 6, "price_Per_Unit": 150.0 }, // Case
        { "level": 3, "uom_ID": 7, "price_Per_Unit": 750.0 } // Pallet
      ]
    }
  ],
  "supplier_ID": "SUP-789",
  "restock_Clerk": "USER-456",
  "notes": "Regular monthly restock"
}
```

**Backend updates:**

1. Creates restock `RS-2026-000042`
2. Adds 200 to `Inventory.Total_Quantity`
3. Adds 200 to `Product_Unit_Preset.Main_Unit_Quantity`
4. Creates/updates `Product_Unit_Preset_Quantity`:
   - Level 1 (Box): 200 units
   - Level 2 (Case): 20 units (200 ÷ 10)
   - Level 3 (Pallet): 4 units (20 ÷ 5)

## Error Handling

The system validates:

- Product must exist
- Preset must exist and be assigned to the product
- Preset must have a Level 1 (main unit)
- All pricing levels must be provided
- Quantities must be positive

## Next Steps

To use this endpoint:

1. Ensure products have unit presets assigned via `/api/unit-preset/assign`
2. Configure preset levels and conversion factors
3. Set up pricing for each level
4. Use the frontend restock modal to create restocks
5. Monitor inventory levels updated in real-time

## Controller Location

File: `/backend/Controller/RestockControllers/CreateUnitPresetRestockController.cs`

## Related Models

- `Restock.cs` - Main restock entity
- `RestockBatch.cs` - Supplier batch information
- `RestockLineItems.cs` - Individual products in restock
- `Product_Unit_Preset.cs` - Product-preset relationship
- `Product_Unit_Preset_Quantity.cs` - Level-wise quantity tracking
- `Inventory.cs` - Overall product quantities

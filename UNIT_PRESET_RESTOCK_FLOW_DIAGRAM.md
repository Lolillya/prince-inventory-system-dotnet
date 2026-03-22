# Unit Preset Restock - Data Flow Diagram

## Request → Database Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND REQUEST                             │
│                                                                  │
│  POST /api/restock/unit-preset                                  │
│  {                                                              │
│    lineItems: [{ product_ID, preset_ID, main_Unit_Quantity }] │
│    supplier_ID: "SUP-001"                                      │
│    restock_Clerk: "USER-123"                                   │
│  }                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              BEGIN DATABASE TRANSACTION                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Create Restock Record                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Table: Restock                                                │
│  INSERT: {                                                     │
│    Restock_Number: "RS-2026-000001" (auto-generated)          │
│    Restock_Clerk: "USER-123"                                  │
│    Restock_Notes: "..."                                       │
│    CreatedAt, UpdatedAt                                       │
│  }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Create RestockBatch                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Table: RestockBatch                                           │
│  INSERT: {                                                     │
│    Restock_ID: 1 (from Step 1)                                │
│    Supplier_ID: "SUP-001"                                     │
│    Batch_Number: 1                                            │
│    CreatedAt, UpdatedAt                                       │
│  }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FOR EACH LINE ITEM (Product)                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ STEP 3a: Create RestockLineItem                         │ │
│  │ ───────────────────────────────────────────────────────  │ │
│  │ Table: RestockLineItems                                 │ │
│  │ INSERT: {                                               │ │
│  │   Product_ID: 1                                         │ │
│  │   Batch_ID: 1 (from Step 2)                            │ │
│  │   Preset_ID: 5                                         │ │
│  │   Base_UOM_ID: 10                                      │ │
│  │   Base_Unit_Quantity: 100                              │ │
│  │   Base_Unit_Price: 25.50                               │ │
│  │ }                                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                     │                                          │
│                     ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ STEP 3b: Store Level Pricing                            │ │
│  │ ───────────────────────────────────────────────────────  │ │
│  │ Table: RestockLineItem_PresetPricing                    │ │
│  │ INSERT (for each level):                                │ │
│  │   Level 1: { LineItem_ID, Level:1, UOM_ID:10, $25.50 } │ │
│  │   Level 2: { LineItem_ID, Level:2, UOM_ID:11, $255.00 }│ │
│  └──────────────────────────────────────────────────────────┘ │
│                     │                                          │
│                     ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ STEP 3c: Update Inventory                               │ │
│  │ ───────────────────────────────────────────────────────  │ │
│  │ Table: Inventory                                        │ │
│  │ UPDATE:                                                 │ │
│  │   Total_Quantity += 100  (add restocked amount)        │ │
│  │   Updated_At = NOW()                                   │ │
│  │                                                         │ │
│  │ (OR INSERT if product doesn't exist in inventory)      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                     │                                          │
│                     ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ⭐ STEP 3d: Update Product_Unit_Preset (NEW!)           │ │
│  │ ───────────────────────────────────────────────────────  │ │
│  │ Table: Product_Unit_Preset                              │ │
│  │ UPDATE:                                                 │ │
│  │   Main_Unit_Quantity += 100  (add to preset total)     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                     │                                          │
│                     ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ⭐ STEP 3e: Update Preset Quantities (NEW!)             │ │
│  │ ───────────────────────────────────────────────────────  │ │
│  │ Table: Product_Unit_Preset_Quantity                     │ │
│  │                                                         │ │
│  │ Calculate quantities for each level:                   │ │
│  │   Input: 100 Boxes (main unit)                         │ │
│  │                                                         │ │
│  │   Level 1 (Box):                                       │ │
│  │     UPDATE/INSERT:                                     │ │
│  │       Original_Quantity += 100                         │ │
│  │       Remaining_Quantity += 100                        │ │
│  │                                                         │ │
│  │   Level 2 (Case, 10 boxes per case):                  │ │
│  │     Calculated: 100 ÷ 10 = 10 cases                   │ │
│  │     UPDATE/INSERT:                                     │ │
│  │       Original_Quantity += 10                          │ │
│  │       Remaining_Quantity += 10                         │ │
│  │                                                         │ │
│  │   Level 3 (Pallet, 5 cases per pallet):              │ │
│  │     Calculated: 10 ÷ 5 = 2 pallets                    │ │
│  │     UPDATE/INSERT:                                     │ │
│  │       Original_Quantity += 2                           │ │
│  │       Remaining_Quantity += 2                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMMIT TRANSACTION                                  │
│              (All changes saved atomically)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE TO FRONTEND                          │
│  {                                                              │
│    message: "Restock created successfully"                     │
│    restock_Number: "RS-2026-000001"                            │
│    restock_ID: 1                                               │
│  }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Tables Updated Summary

| #   | Table                           | Action        | Records                                    |
| --- | ------------------------------- | ------------- | ------------------------------------------ |
| 1   | `Restock`                       | INSERT        | 1 record                                   |
| 2   | `RestockBatch`                  | INSERT        | 1 record                                   |
| 3   | `RestockLineItems`              | INSERT        | N records (N = # of line items)            |
| 4   | `RestockLineItem_PresetPricing` | INSERT        | N × L records (L = # of levels per preset) |
| 5   | `Inventory`                     | UPDATE/INSERT | N records                                  |
| 6   | `Product_Unit_Preset`           | UPDATE        | N records                                  |
| 7   | `Product_Unit_Preset_Quantity`  | UPDATE/INSERT | N × L records                              |

⭐ **Steps 6-7 are the new enhancements**

## Quantity Calculation Example

### Scenario Setup

```
Product: Notebook A4
Preset: Box → Case → Pallet
  - Level 1: Box (base unit)
  - Level 2: Case (10 boxes per case)
  - Level 3: Pallet (5 cases per pallet)

Restock Amount: 100 Boxes
```

### Calculation Flow

```
┌──────────────────────────────────────┐
│ Input: 100 Boxes (Main Unit)        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Level 1 (Box)                       │
│ Quantity = 100                      │
│ (Direct from input)                 │
└──────────────┬───────────────────────┘
               │
               ▼ Divide by Level 2 conversion (10)
┌──────────────────────────────────────┐
│ Level 2 (Case)                      │
│ Quantity = 100 ÷ 10 = 10            │
│ (Calculated)                        │
└──────────────┬───────────────────────┘
               │
               ▼ Divide by Level 3 conversion (5)
┌──────────────────────────────────────┐
│ Level 3 (Pallet)                    │
│ Quantity = 10 ÷ 5 = 2               │
│ (Calculated)                        │
└──────────────────────────────────────┘
```

### Database After Update

```sql
-- Product_Unit_Preset
Main_Unit_Quantity: [previous_value] + 100

-- Product_Unit_Preset_Quantity
Level 1: Original = [prev] + 100, Remaining = [prev] + 100
Level 2: Original = [prev] + 10,  Remaining = [prev] + 10
Level 3: Original = [prev] + 2,   Remaining = [prev] + 2

-- Inventory
Total_Quantity: [previous_value] + 100
```

## Error Handling Flow

```
┌─────────────────────────────────────┐
│  Any Error Occurs?                 │
│  (Invalid preset, FK violation,    │
│   database error, etc.)            │
└────────────┬────────────────────────┘
             │
             ▼ YES
┌─────────────────────────────────────┐
│  ROLLBACK TRANSACTION              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - All changes undone              │
│  - No partial data committed       │
│  - Database remains consistent     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Return Error Response (400/500)   │
│  {                                 │
│    error: "Detailed message"       │
│  }                                 │
└─────────────────────────────────────┘
```

## Key Implementation Details

### Transaction Scope

All operations are wrapped in `BeginTransactionAsync()`:

- Ensures atomicity (all-or-nothing)
- Maintains referential integrity
- Prevents orphaned records
- Rolls back on any error

### Smart Quantity Distribution

The system automatically:

1. Takes the main unit quantity (e.g., 100 boxes)
2. Records it for Level 1
3. For each subsequent level:
   - Divides by the level's conversion factor
   - Records the calculated quantity
   - Uses integer division (whole units only)

### Dual Quantity Tracking

- **Original_Quantity**: Never decreases, tracks total received
- **Remaining_Quantity**: Decreases on sales, tracks available stock

### Performance Optimization

- Single transaction for all operations
- Batch inserts where possible
- Minimal database round trips
- Efficient querying with Include()

---

**This diagram shows the complete data flow from frontend request to database updates, including the new enhancements for unit preset quantity tracking.**

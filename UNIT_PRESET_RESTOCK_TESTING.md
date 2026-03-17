# Testing Guide: Unit Preset Restock API

## Prerequisites

Before testing, ensure:

1. Database has been migrated with all tables
2. At least one product exists with a unit preset assigned
3. A supplier exists in PersonalDetails table
4. A user (clerk) exists in PersonalDetails table

## Test Scenario Setup

### 1. Check Existing Data

```sql
-- Check if product has preset assigned
SELECT p.Product_ID, p.Product_Name, pup.Product_Preset_ID, pup.Preset_ID, pup.Main_Unit_Quantity
FROM Products p
LEFT JOIN Product_Unit_Presets pup ON p.Product_ID = pup.Product_ID
WHERE pup.Preset_ID IS NOT NULL
LIMIT 5;

-- Check preset levels for conversion calculation
SELECT upl.Preset_ID, upl.Level, uom.UOM_Name, upl.Conversion_Factor
FROM Unit_Preset_Levels upl
JOIN UnitOfMeasures uom ON upl.UOM_ID = uom.UOM_ID
WHERE upl.Preset_ID = 1  -- Replace with actual preset ID
ORDER BY upl.Level;

-- Check current inventory
SELECT * FROM Inventory WHERE Product_ID = 1;  -- Replace with actual product ID
```

## Test Cases

### Test Case 1: Simple Restock (Single Product, One Preset)

**Request:**

```bash
curl -X POST http://localhost:5055/api/restock/unit-preset \
  -H "Content-Type: application/json" \
  -d '{
    "lineItems": [
      {
        "product_ID": 1,
        "preset_ID": 1,
        "main_Unit_Quantity": 100,
        "levelPricing": [
          {
            "level": 1,
            "uom_ID": 10,
            "price_Per_Unit": 25.50
          },
          {
            "level": 2,
            "uom_ID": 11,
            "price_Per_Unit": 255.00
          }
        ]
      }
    ],
    "supplier_ID": "SUP-001",
    "restock_Clerk": "USER-001",
    "notes": "Test restock"
  }'
```

**Expected Database Changes:**

1. **Restock Table** - New record:

   ```sql
   SELECT * FROM Restocks WHERE Restock_Number LIKE 'RS-2026-%' ORDER BY Restock_ID DESC LIMIT 1;
   -- Should have: Restock_Clerk = "USER-001", Restock_Notes = "Test restock"
   ```

2. **RestockBatch Table** - New record:

   ```sql
   SELECT * FROM RestockBatches ORDER BY Batch_ID DESC LIMIT 1;
   -- Should have: Supplier_ID = "SUP-001", Batch_Number = 1
   ```

3. **RestockLineItems Table** - New record:

   ```sql
   SELECT * FROM RestockLineItems ORDER BY LineItem_ID DESC LIMIT 1;
   -- Should have: Product_ID = 1, Preset_ID = 1, Base_Unit_Quantity = 100
   ```

4. **RestockLineItem_PresetPricing Table** - 2 new records:

   ```sql
   SELECT * FROM RestockLineItem_PresetPricing
   WHERE LineItem_ID = (SELECT LineItem_ID FROM RestockLineItems ORDER BY LineItem_ID DESC LIMIT 1);
   -- Should have 2 records: Level 1 ($25.50) and Level 2 ($255.00)
   ```

5. **Inventory Table** - Updated:

   ```sql
   SELECT Total_Quantity FROM Inventory WHERE Product_ID = 1;
   -- Total_Quantity should increase by 100
   ```

6. **Product_Unit_Preset Table** - Updated:

   ```sql
   SELECT Main_Unit_Quantity FROM Product_Unit_Presets
   WHERE Product_ID = 1 AND Preset_ID = 1;
   -- Main_Unit_Quantity should increase by 100
   ```

7. **Product_Unit_Preset_Quantity Table** - Created/Updated:
   ```sql
   SELECT Level, Original_Quantity, Remaining_Quantity
   FROM Product_Unit_Preset_Quantities pq
   JOIN Product_Unit_Presets pup ON pq.Product_Preset_ID = pup.Product_Preset_ID
   WHERE pup.Product_ID = 1 AND pup.Preset_ID = 1
   ORDER BY Level;
   -- Should show quantities for each level based on conversion factors
   -- Example: Level 1 = 100, Level 2 = 10 (if conversion is 1:10)
   ```

### Test Case 2: Multiple Products

**Request:**

```bash
curl -X POST http://localhost:5055/api/restock/unit-preset \
  -H "Content-Type: application/json" \
  -d '{
    "lineItems": [
      {
        "product_ID": 1,
        "preset_ID": 1,
        "main_Unit_Quantity": 50,
        "levelPricing": [
          {"level": 1, "uom_ID": 10, "price_Per_Unit": 25.50},
          {"level": 2, "uom_ID": 11, "price_Per_Unit": 255.00}
        ]
      },
      {
        "product_ID": 2,
        "preset_ID": 2,
        "main_Unit_Quantity": 200,
        "levelPricing": [
          {"level": 1, "uom_ID": 12, "price_Per_Unit": 10.00},
          {"level": 2, "uom_ID": 13, "price_Per_Unit": 100.00}
        ]
      }
    ],
    "supplier_ID": "SUP-002",
    "restock_Clerk": "USER-002",
    "notes": "Bulk order from multiple products"
  }'
```

**Verify:**

- 1 Restock record created
- 1 RestockBatch record created
- 2 RestockLineItems records created
- Both products' inventories updated
- Both Product_Unit_Preset records updated

### Test Case 3: Error - Invalid Preset

**Request:**

```bash
curl -X POST http://localhost:5055/api/restock/unit-preset \
  -H "Content-Type: application/json" \
  -d '{
    "lineItems": [
      {
        "product_ID": 1,
        "preset_ID": 999,
        "main_Unit_Quantity": 100,
        "levelPricing": [
          {"level": 1, "uom_ID": 10, "price_Per_Unit": 25.50}
        ]
      }
    ],
    "supplier_ID": "SUP-001",
    "restock_Clerk": "USER-001",
    "notes": ""
  }'
```

**Expected Response:**

```json
{
  "statusCode": 400,
  "message": "Product 1 does not have preset 999"
}
```

**Verify:**

- No database changes (transaction rolled back)
- No partial records created

### Test Case 4: Verify Multi-Level Quantity Calculation

For a preset with 3 levels:

- Level 1: Box (base unit)
- Level 2: Case (10 boxes per case)
- Level 3: Pallet (5 cases per pallet)

**Input:** 100 boxes

**Expected Output in Product_Unit_Preset_Quantity:**

```
Level 1: 100 boxes
Level 2: 10 cases (100 ÷ 10)
Level 3: 2 pallets (10 ÷ 5)
```

**Query to Verify:**

```sql
SELECT
    upl.Level,
    uom.UOM_Name,
    pupq.Original_Quantity,
    pupq.Remaining_Quantity,
    upl.Conversion_Factor
FROM Product_Unit_Preset_Quantities pupq
JOIN Product_Unit_Presets pup ON pupq.Product_Preset_ID = pup.Product_Preset_ID
JOIN Unit_Preset_Levels upl ON pup.Preset_ID = upl.Preset_ID AND pupq.Level = upl.Level
JOIN UnitOfMeasures uom ON pupq.UOM_ID = uom.UOM_ID
WHERE pup.Product_ID = 1 AND pup.Preset_ID = 1
ORDER BY pupq.Level;
```

## Using with Frontend

The frontend in `restock-modal-table.tsx` already has the correct payload structure:

```typescript
const restockPayload = {
  lineItems: payload.lineItems, // Array of line items
  supplier_ID: supplier.id, // Selected supplier
  restock_Clerk: user.user_ID, // Current user
  notes: "", // Optional notes
};

createRestock(restockPayload);
```

## Common Issues and Fixes

### Issue 1: "Product does not have preset"

**Cause:** Product_Unit_Preset record missing
**Fix:** Assign preset to product first:

```sql
INSERT INTO Product_Unit_Presets (Product_ID, Preset_ID, Main_Unit_Quantity, Assigned_At)
VALUES (1, 1, 0, NOW());
```

### Issue 2: "Preset does not have a main unit (Level 1)"

**Cause:** Unit_Preset_Level table missing Level 1 record
**Fix:** Create Level 1 record for preset:

```sql
INSERT INTO Unit_Preset_Levels (Preset_ID, UOM_ID, Level, Conversion_Factor, Created_At)
VALUES (1, 10, 1, 1, NOW());
```

### Issue 3: Transaction rollback without clear error

**Cause:** Database constraint violation or missing foreign key
**Fix:** Check:

- Supplier_ID exists in PersonalDetails
- Restock_Clerk exists in PersonalDetails
- All UOM_IDs exist in UnitOfMeasures

## Rollback Test

To ensure transaction safety:

1. Record current counts:

```sql
SELECT
    (SELECT COUNT(*) FROM Restocks) as restocks,
    (SELECT COUNT(*) FROM RestockBatches) as batches,
    (SELECT COUNT(*) FROM RestockLineItems) as line_items,
    (SELECT Total_Quantity FROM Inventory WHERE Product_ID = 1) as inventory_qty,
    (SELECT Main_Unit_Quantity FROM Product_Unit_Presets WHERE Product_ID = 1) as preset_qty;
```

2. Send request with invalid data (e.g., non-existent preset_ID)

3. Verify counts unchanged - no partial data committed

## Performance Check

For large restocks (100+ line items):

```bash
# Use time command
time curl -X POST http://localhost:5055/api/restock/unit-preset \
  -H "Content-Type: application/json" \
  -d @large_restock_payload.json
```

Expected: < 5 seconds for 100 line items

## Next Steps After Testing

1. ✅ Verify all tables updated correctly
2. ✅ Check frontend displays new restock in list
3. ✅ Confirm inventory counts reflect restocked quantities
4. ✅ Test error handling and transaction rollback
5. ✅ Performance test with realistic data volume

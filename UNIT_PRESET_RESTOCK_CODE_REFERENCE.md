# Quick Reference: What Was Added to CreateUnitPresetRestockController

## Location

`/backend/Controller/RestockControllers/CreateUnitPresetRestockController.cs`

## Changes Made

The following code was **ADDED** after the inventory update section (around line 155):

```csharp
// ==================== NEW CODE STARTS HERE ====================

// Update Product_Unit_Preset.Main_Unit_Quantity
productPreset.Main_Unit_Quantity += lineItemDto.Main_Unit_Quantity;
_db.Product_Unit_Presets.Update(productPreset);
await _db.SaveChangesAsync();

// Update Product_Unit_Preset_Quantity for each level
var presetLevels = productPreset.Preset.PresetLevels
    .OrderBy(pl => pl.Level)
    .ToList();

int remainingQuantity = lineItemDto.Main_Unit_Quantity;

for (int i = 0; i < presetLevels.Count; i++)
{
    var level = presetLevels[i];

    // Check if quantity record exists for this level
    var quantityRecord = await _db.Product_Unit_Preset_Quantities
        .FirstOrDefaultAsync(q =>
            q.Product_Preset_ID == productPreset.Product_Preset_ID &&
            q.Level == level.Level);

    if (quantityRecord != null)
    {
        // Update existing record
        quantityRecord.Original_Quantity += remainingQuantity;
        quantityRecord.Remaining_Quantity += remainingQuantity;
        quantityRecord.Updated_At = DateTime.UtcNow;
        _db.Product_Unit_Preset_Quantities.Update(quantityRecord);
    }
    else
    {
        // Create new quantity record
        quantityRecord = new backend.Models.Unit.Product_Unit_Preset_Quantity
        {
            Product_Preset_ID = productPreset.Product_Preset_ID,
            Level = level.Level,
            UOM_ID = level.UOM_ID,
            Original_Quantity = remainingQuantity,
            Remaining_Quantity = remainingQuantity,
            Created_At = DateTime.UtcNow,
            Updated_At = DateTime.UtcNow
        };
        _db.Product_Unit_Preset_Quantities.Add(quantityRecord);
    }

    // Calculate quantity for next level if it exists
    if (i < presetLevels.Count - 1)
    {
        // The next level's conversion factor tells us how many smaller units make up one larger unit
        // For example, if level 2 has conversion_factor = 10, then 10 boxes = 1 case
        var nextLevel = presetLevels[i + 1];
        remainingQuantity = remainingQuantity / nextLevel.Conversion_Factor;
    }
}

await _db.SaveChangesAsync();

// ==================== NEW CODE ENDS HERE ====================
```

## Context: Where the Code Was Added

**BEFORE (Original):**

```csharp
// Update inventory
var inventory = await _db.Inventory
    .FirstOrDefaultAsync(i => i.Product_ID == lineItemDto.Product_ID);

if (inventory != null)
{
    inventory.Total_Quantity += lineItemDto.Main_Unit_Quantity;
    inventory.Updated_At = DateTime.UtcNow;
    _db.Inventory.Update(inventory);
}
else
{
    // Create new inventory entry
    // ... code omitted for brevity ...
}

await _db.SaveChangesAsync();

// [END OF LOOP] - Loop continues to next line item
```

**AFTER (Enhanced):**

```csharp
// Update inventory
var inventory = await _db.Inventory
    .FirstOrDefaultAsync(i => i.Product_ID == lineItemDto.Product_ID);

if (inventory != null)
{
    inventory.Total_Quantity += lineItemDto.Main_Unit_Quantity;
    inventory.Updated_At = DateTime.UtcNow;
    _db.Inventory.Update(inventory);
}
else
{
    // Create new inventory entry
    // ... code omitted for brevity ...
}

await _db.SaveChangesAsync();

// ⭐ NEW: Update Product_Unit_Preset.Main_Unit_Quantity
productPreset.Main_Unit_Quantity += lineItemDto.Main_Unit_Quantity;
_db.Product_Unit_Presets.Update(productPreset);
await _db.SaveChangesAsync();

// ⭐ NEW: Update Product_Unit_Preset_Quantity for each level
var presetLevels = productPreset.Preset.PresetLevels
    .OrderBy(pl => pl.Level)
    .ToList();

int remainingQuantity = lineItemDto.Main_Unit_Quantity;

for (int i = 0; i < presetLevels.Count; i++)
{
    // ... new code for quantity tracking ...
}

await _db.SaveChangesAsync();

// [END OF LOOP] - Loop continues to next line item
```

## What Each Part Does

### Part 1: Update Product_Unit_Preset

```csharp
productPreset.Main_Unit_Quantity += lineItemDto.Main_Unit_Quantity;
_db.Product_Unit_Presets.Update(productPreset);
await _db.SaveChangesAsync();
```

**Purpose**: Adds the restocked quantity to the preset's total main unit quantity.

**Example**: If `Main_Unit_Quantity` was 500 and you restock 100, it becomes 600.

---

### Part 2: Get Preset Levels

```csharp
var presetLevels = productPreset.Preset.PresetLevels
    .OrderBy(pl => pl.Level)
    .ToList();
```

**Purpose**: Gets all levels for this preset, ordered from Level 1 (base) to highest level.

**Example**:

- Level 1: Box
- Level 2: Case
- Level 3: Pallet

---

### Part 3: Initialize Quantity Variable

```csharp
int remainingQuantity = lineItemDto.Main_Unit_Quantity;
```

**Purpose**: Starts with the input quantity (main unit) and calculates derived quantities for higher levels.

**Example**: If restocking 100 Boxes, `remainingQuantity` starts at 100.

---

### Part 4: Loop Through Each Level

```csharp
for (int i = 0; i < presetLevels.Count; i++)
{
    var level = presetLevels[i];

    // Find existing record or create new one
    var quantityRecord = await _db.Product_Unit_Preset_Quantities
        .FirstOrDefaultAsync(q =>
            q.Product_Preset_ID == productPreset.Product_Preset_ID &&
            q.Level == level.Level);
```

**Purpose**: For each level in the preset, check if a quantity record already exists.

---

### Part 5: Update Existing or Create New Record

```csharp
if (quantityRecord != null)
{
    // Update existing record
    quantityRecord.Original_Quantity += remainingQuantity;
    quantityRecord.Remaining_Quantity += remainingQuantity;
    quantityRecord.Updated_At = DateTime.UtcNow;
    _db.Product_Unit_Preset_Quantities.Update(quantityRecord);
}
else
{
    // Create new quantity record
    quantityRecord = new backend.Models.Unit.Product_Unit_Preset_Quantity
    {
        Product_Preset_ID = productPreset.Product_Preset_ID,
        Level = level.Level,
        UOM_ID = level.UOM_ID,
        Original_Quantity = remainingQuantity,
        Remaining_Quantity = remainingQuantity,
        Created_At = DateTime.UtcNow,
        Updated_At = DateTime.UtcNow
    };
    _db.Product_Unit_Preset_Quantities.Add(quantityRecord);
}
```

**Purpose**:

- If record exists: Add to existing quantities
- If not: Create new record with the calculated quantity

**Example**:

- Level 1: Add 100 to existing quantities
- Level 2: Add 10 to existing quantities (or create with 10)

---

### Part 6: Calculate Next Level Quantity

```csharp
if (i < presetLevels.Count - 1)
{
    var nextLevel = presetLevels[i + 1];
    remainingQuantity = remainingQuantity / nextLevel.Conversion_Factor;
}
```

**Purpose**: Calculates the quantity for the next higher level using integer division.

**Example**:

- Level 1: 100 Boxes
- Level 2 has `Conversion_Factor = 10` (10 boxes per case)
- Calculation: `100 ÷ 10 = 10 Cases`
- `remainingQuantity` now becomes 10 for the next iteration

---

## Key Concepts

### Conversion Factor

The `Conversion_Factor` in `Unit_Preset_Level` tells how many units of the lower level equal one unit of this level.

**Example**:

```
Level 2 (Case): Conversion_Factor = 10
Meaning: 1 Case = 10 Boxes (from Level 1)
```

### Integer Division

We use C# integer division (`/`) which automatically rounds down.

**Example**:

```csharp
105 / 10 = 10  // Not 10.5, always whole units
```

### Both Quantities Updated

```csharp
quantityRecord.Original_Quantity += remainingQuantity;
quantityRecord.Remaining_Quantity += remainingQuantity;
```

- **Original_Quantity**: Total ever received (historical tracking)
- **Remaining_Quantity**: Currently available (decreases on sales)

Both are increased during restock.

---

## No Other Changes Required

✅ **No changes to Models** - Already have necessary fields
✅ **No changes to DTOs** - Already properly structured
✅ **No changes to Database Context** - DbSets already exist
✅ **No changes to Frontend** - Already sends correct payload
✅ **No migrations needed** - Tables already exist

---

## Summary

**Lines Added**: ~50 lines of code
**Location**: Inside the `foreach (var lineItemDto in dto.LineItems)` loop
**Placement**: After inventory update, before loop ends
**Purpose**: Track restocked quantities at all preset levels
**Impact**: Zero breaking changes, 100% backward compatible

---

## Testing the Change

Run this after a restock:

```sql
-- Check Product_Unit_Preset was updated
SELECT Product_ID, Preset_ID, Main_Unit_Quantity
FROM Product_Unit_Presets
WHERE Product_ID = [YOUR_PRODUCT_ID];

-- Check all levels were updated/created
SELECT pq.Level, uom.UOM_Name, pq.Original_Quantity, pq.Remaining_Quantity
FROM Product_Unit_Preset_Quantities pq
JOIN Product_Unit_Presets pup ON pq.Product_Preset_ID = pup.Product_Preset_ID
JOIN UnitOfMeasures uom ON pq.UOM_ID = uom.UOM_ID
WHERE pup.Product_ID = [YOUR_PRODUCT_ID]
ORDER BY pq.Level;
```

Expected: See updated quantities for all levels in the preset!

---

**That's it! Simple, clean, and powerful enhancement.** 🚀

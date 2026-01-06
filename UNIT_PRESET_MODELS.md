# Unit Preset Database Models

## Overview

Three related tables for managing unit conversion presets and product assignments.

## Tables

### 1. Unit_Preset

Main preset definition table.

**Columns:**

- `Preset_ID` (PK) - Unique identifier
- `Preset_Name` - Display name (e.g., "Box-Cases-Pieces")
- `Main_Unit_ID` (FK to UnitOfMeasure) - The base/main unit
- `Created_At` - Timestamp
- `Updated_At` - Timestamp

### 2. Unit_Preset_Level

Defines the conversion chain/hierarchy for each preset (max 5 levels).

**Columns:**

- `Level_ID` (PK) - Unique identifier
- `Preset_ID` (FK to Unit_Preset) - Links to the preset
- `UOM_ID` (FK to UnitOfMeasure) - The unit at this level
- `Level` (int) - Position in hierarchy (1 = main, 2 = next, etc.)
- `Conversion_Factor` (int) - How many of next lower unit
- `Created_At` - Timestamp

### 3. Product_Unit_Preset

Junction table for many-to-many relationship between products and presets.

**Columns:**

- `Product_Preset_ID` (PK) - Unique identifier
- `Product_ID` (FK to Product) - Product using this preset
- `Preset_ID` (FK to Unit_Preset) - The preset being used
- `Assigned_At` - Timestamp

## Example Data

### Scenario: Box > Cases > Pieces

**Unit_Preset:**

```
Preset_ID: 1
Preset_Name: "Box-Cases-Pieces"
Main_Unit_ID: 5 (Box)
```

**Unit_Preset_Level:**

```
Level_ID: 1, Preset_ID: 1, UOM_ID: 5 (Box), Level: 1, Conversion_Factor: 10
Level_ID: 2, Preset_ID: 1, UOM_ID: 3 (Cases), Level: 2, Conversion_Factor: 12
Level_ID: 3, Preset_ID: 1, UOM_ID: 1 (Pieces), Level: 3, Conversion_Factor: 1
```

_Meaning: 1 Box = 10 Cases, 1 Case = 12 Pieces_

**Product_Unit_Preset:**

```
Product_Preset_ID: 1, Product_ID: 101, Preset_ID: 1
Product_Preset_ID: 2, Product_ID: 102, Preset_ID: 1
```

_Products 101 and 102 use the "Box-Cases-Pieces" preset_

## Usage in Code

### Creating a Preset

```csharp
var preset = new Unit_Preset
{
    Preset_Name = "Box-Cases-Pieces",
    Main_Unit_ID = 5, // Box
    PresetLevels = new List<Unit_Preset_Level>
    {
        new() { UOM_ID = 5, Level = 1, Conversion_Factor = 10 }, // Box
        new() { UOM_ID = 3, Level = 2, Conversion_Factor = 12 }, // Cases
        new() { UOM_ID = 1, Level = 3, Conversion_Factor = 1 }   // Pieces
    }
};
```

### Assigning Products to Preset

```csharp
var productPreset = new Product_Unit_Preset
{
    Product_ID = 101,
    Preset_ID = 1
};
```

## Next Steps

1. Add these DbSet entries to ApplicationDBContext
2. Create and run migration
3. Create DTOs for API endpoints
4. Implement controllers for CRUD operations

/**
 * Unit Preset Restock State Management Flow
 * 
 * This document explains how the state flows through the application
 * for the unit preset-based restock feature.
 */

// ============================================================================
// 1. INITIAL STATE - Empty Store
// ============================================================================
// When the user first loads the page, the store is empty
{
  items: []
}

// ============================================================================
// 2. ADD PRODUCT - User clicks a product from inventory list
// ============================================================================
// Action: addProduct(product)
// Location: index.tsx -> handleClick()
{
  items: [
    {
      product: { product_ID: 1, product_Name: "Product A", ... },
      brand: { brand_Name: "Brand X", ... },
      variant: { variant_Name: "Variant Y", ... },
      unitPresets: [
        {
          preset_ID: 1,
          preset: {
            preset_Name: "Box-Cases-Pieces",
            mainUnit: { unit_Name: "Box", ... },
            presetLevels: [
              { level: 1, unitOfMeasure: { unit_Name: "Box" }, ... },
              { level: 2, unitOfMeasure: { unit_Name: "Cases" }, ... },
              { level: 3, unitOfMeasure: { unit_Name: "Pieces" }, ... }
            ]
          }
        }
      ],
      selectedPreset: undefined  // No preset selected yet
    }
  ]
}

// ============================================================================
// 3. SELECT PRESET - User chooses a preset from dropdown
// ============================================================================
// Action: selectPreset(productId, presetId)
// Location: restock-card-copy.tsx -> handlePresetChange()
{
  items: [
    {
      product: { ... },
      brand: { ... },
      variant: { ... },
      unitPresets: [ ... ],
      selectedPreset: {
        preset_ID: 1,
        main_Unit_Quantity: 0,
        levelPricing: [
          { level: 1, uom_ID: 5, uom_Name: "Box", price_Per_Unit: 0 },
          { level: 2, uom_ID: 3, uom_Name: "Cases", price_Per_Unit: 0 },
          { level: 3, uom_ID: 1, uom_Name: "Pieces", price_Per_Unit: 0 }
        ]
      }
    }
  ]
}

// ============================================================================
// 4. UPDATE QUANTITY - User enters quantity in main unit
// ============================================================================
// Action: updateMainQuantity(productId, quantity)
// Location: restock-card-copy.tsx -> handleQuantityChange()
{
  items: [
    {
      ...,
      selectedPreset: {
        preset_ID: 1,
        main_Unit_Quantity: 100,  // Updated!
        levelPricing: [ ... ]
      }
    }
  ]
}

// ============================================================================
// 5. UPDATE PRICING - User enters price for each level
// ============================================================================
// Action: updateLevelPricing(productId, level, price)
// Location: restock-card-copy.tsx -> handlePriceChange()
{
  items: [
    {
      ...,
      selectedPreset: {
        preset_ID: 1,
        main_Unit_Quantity: 100,
        levelPricing: [
          { level: 1, uom_ID: 5, uom_Name: "Box", price_Per_Unit: 1000.00 },
          { level: 2, uom_ID: 3, uom_Name: "Cases", price_Per_Unit: 100.00 },
          { level: 3, uom_ID: 1, uom_Name: "Pieces", price_Per_Unit: 10.00 }
        ]
      }
    }
  ]
}

// ============================================================================
// 6. GET PAYLOAD - User clicks "Save" button
// ============================================================================
// Action: getPayload()
// Location: restock-modal-table.tsx -> handleCreateRestock()
// Returns payload ready for API:
{
  lineItems: [
    {
      product_ID: 1,
      preset_ID: 1,
      main_Unit_Quantity: 100,
      levelPricing: [
        { level: 1, uom_ID: 5, price_Per_Unit: 1000.00 },
        { level: 2, uom_ID: 3, price_Per_Unit: 100.00 },
        { level: 3, uom_ID: 1, price_Per_Unit: 10.00 }
      ]
    }
  ]
}

// This payload is then sent to the API with supplier and clerk info:
{
  lineItems: [ ... ],
  supplier_ID: "supplier-guid",
  restock_Clerk: "clerk-guid",
  notes: ""
}

// ============================================================================
// 7. CLEAR ALL - After successful save
// ============================================================================
// Action: clearAll()
// Location: restock-modal-table.tsx -> after successful API call
{
  items: []  // Back to empty state
}

// ============================================================================
// REMOVE PRODUCT - User clicks X on a card
// ============================================================================
// Action: removeProduct(productId)
// Location: index.tsx -> handleRemoveProduct()
// Removes the item from the array

// ============================================================================
// Store Methods Summary
// ============================================================================
/*
  addProduct(product)           - Add product to restock list
  removeProduct(productId)      - Remove product from list
  selectPreset(productId, presetId) - Select preset, initialize pricing array
  updateMainQuantity(productId, quantity) - Update quantity in main unit
  updateLevelPricing(productId, level, price) - Update price for specific level
  clearAll()                    - Clear all items (after save)
  getPayload()                  - Get API-ready payload
*/

// ============================================================================
// Component Responsibilities
// ============================================================================
/*
  index.tsx
    - Fetches inventory data
    - Handles product selection
    - Handles product removal
    - Displays selected products

  restock-card-copy.tsx
    - Manages local state for UI (selected preset ID, quantities, prices)
    - Syncs local state with global store
    - Shows/hides inputs based on preset selection
    - Handles user input

  restock-modal-table.tsx
    - Displays summary of selected items
    - Calculates totals
    - Calls API to create restock
    - Clears store after successful save
*/

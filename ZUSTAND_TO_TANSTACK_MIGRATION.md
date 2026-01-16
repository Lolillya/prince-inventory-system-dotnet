# Migration from Zustand to TanStack Query

## Summary

Successfully migrated unit preset restock state management from Zustand to TanStack Query to align with the project's existing state management patterns.

## Changes Made

### New File Created

- **`/frontend/src/features/restock/unit-preset-restock.query.ts`**
  - Implements all state management using TanStack Query
  - Exports `useUnitPresetRestockItems()` for accessing restock items
  - Exports `useUnitPresetRestock()` for state mutations
  - Exports `useCreateUnitPresetRestock()` mutation for API calls

### Files Updated

1. **`restock-card-copy.tsx`**

   - Changed import from `useUnitPresetRestockStore` to `useUnitPresetRestock`
   - No other logic changes required

2. **`index.tsx`**

   - Added `useUnitPresetRestockItems()` to get items data
   - Changed from destructuring `items` to using `data: items = []`
   - Updated `useUnitPresetRestock()` for mutations
   - Fixed property name mismatches (created_At vs createdAt, brand_Name vs brandName)

3. **`restock-modal-table.tsx`**
   - Added `useUnitPresetRestockItems()` for items data
   - Added `useCreateUnitPresetRestock()` mutation
   - Removed manual API call and error handling (now handled by mutation)
   - Removed `clearAll()` call (automatically handled by mutation onSuccess)
   - Added loading state with `isPending`
   - Added toast notifications via mutation callbacks

### File to Delete

- **`/frontend/src/features/restock/unit-preset-restock.store.ts`**
  - This Zustand store file should be deleted
  - Run: `rm frontend/src/features/restock/unit-preset-restock.store.ts`

## API Reference

### `useUnitPresetRestockItems()`

Returns the current restock items list.

```typescript
const { data: items = [] } = useUnitPresetRestockItems();
```

### `useUnitPresetRestock()`

Returns state mutation functions.

```typescript
const {
  addProduct,
  removeProduct,
  selectPreset,
  updateMainQuantity,
  updateLevelPricing,
  clearAll,
  getPayload,
} = useUnitPresetRestock();
```

### `useCreateUnitPresetRestock()`

Mutation hook for creating restock via API.

```typescript
const { mutate: createRestock, isPending } = useCreateUnitPresetRestock();

// Usage
createRestock(payload);
```

## Benefits

1. **Consistency**: Now uses the same state management pattern as the rest of the application
2. **Better DevTools**: TanStack Query DevTools integration
3. **Automatic Cache Management**: Query invalidation handled automatically
4. **Built-in Loading States**: `isPending` from mutation
5. **Toast Notifications**: Success/error messages handled in mutation callbacks
6. **No Manual Cleanup**: Clearing state happens automatically on success

## Testing

1. Ensure the old Zustand store file is deleted
2. Test product selection
3. Test preset selection
4. Test quantity and pricing inputs
5. Test restock creation with toast notifications
6. Verify inventory updates after restock creation

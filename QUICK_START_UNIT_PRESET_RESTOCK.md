# Quick Start - Unit Preset Restock

## 1. Run Database Migration

```bash
cd backend
dotnet ef migrations add AddRestockLineItemPresetPricing
dotnet ef database update
```

## 2. Test the Backend API

Start the backend:

```bash
cd backend
dotnet run
```

## 3. Test the Frontend

Start the frontend:

```bash
cd frontend
npm run dev
```

## 4. Usage

1. Navigate to the "New Restock" page
2. Select a product from the right panel
3. In the restock card, select a unit preset from the dropdown
4. Enter the quantity in the main unit
5. Enter prices for each unit level
6. Click "Create Restock" to open the review modal
7. Click "Save" to create the restock

## Key Features

- **Dynamic Preset Selection**: Choose from available presets for each product
- **Conditional UI**: Inputs only show after selecting a preset
- **Multi-Level Pricing**: Set different prices for each unit level
- **Real-Time Calculations**: See subtotals and totals update automatically
- **Complete Tracking**: All preset and pricing data is stored in the database

## API Documentation

See `UNIT_PRESET_RESTOCK_IMPLEMENTATION.md` for detailed API documentation and payload examples.

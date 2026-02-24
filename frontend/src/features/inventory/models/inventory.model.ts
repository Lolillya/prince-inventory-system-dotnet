export type InventoryProductModel = {
  product: {
    quantity: number;
    product_ID: number;
    product_Code: string;
    product_Name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  brand: brand;
  variant: variant;
  category: category;
  unitPresets: UnitPresets[];
  isComplete: boolean;
  restockInfo: RestockInfo[];
};

type brand = {
  brand_ID: number;
  brandName: string;
  createdAt: string;
  updatedAt: string;
};

type variant = {
  variant_ID: number;
  variant_Name: string;
  createdAt: string;
  updatedAt: string;
};

type category = {
  category_ID: number;
  category_Name: string;
  createdAt: string;
  updatedAt: string;
};

type UnitPresets = {
  assigned_At: string;
  preset: Preset;
  preset_ID: number;
  product_Preset_ID: number;
  low_Stock_Level?: number;
  very_Low_Stock_Level?: number;
  presetPricing: PresetPricing[];
};

type Preset = {
  created_At: string;
  main_Unit_ID: number;
  presetLevels: PresetLevel[];
  preset_ID: number;
  preset_Name: string;
  updated_At: string;
};

type PresetLevel = {
  conversion_Factor: number;
  created_At: string;
  level: number;
  level_ID: number;
  unitOfMeasure: UnitOfMeasure;
  uoM_ID: number;
};

type UnitOfMeasure = {
  uom_ID: number;
  uom_Name: string;
};

type RestockInfo = {
  lineItemId: number;
  restockId: number;
  restockNumber: string;
  clerk: {
    id: string;
    firstName: string;
    lastName: string;
  };
  batchId: number;
  batchNumber: number;
  supplier: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
  };
  presetId: number;
  presetName: string;
  base_Unit_Price: number;
  base_Unit_Quantity: number;
  presetPricing: PresetPricing[];
};

type PresetPricing = {
  pricing_ID: number;
  level: number;
  uoM_ID: number;
  unitName: string;
  price_Per_Unit: number;
  created_At: string;
};

/* 

"restockInfo": [
            {
                "lineItemId": 1,
                "restockId": 1,
                "restockNumber": "RS-2026-000001",
                "clerk": {
                    "id": "89d1dd8c-b5c4-46ae-ab6c-9c84df9bcb80",
                    "firstName": "Jane",
                    "lastName": "Doe"
                },
                "batchId": 1,
                "batchNumber": 1,
                "supplier": {
                    "id": "3",
                    "firstName": "Jane",
                    "lastName": "Smith",
                    "companyName": "Educational Supplies Inc."
                },
                "presetId": 1,
                "presetName": "Test Unit Preset",
                "base_Unit_Price": 120.00,
                "base_Unit_Quantity": 1000,
                "presetPricing": [
                    {
                        "pricing_ID": 1,
                        "level": 1,
                        "uoM_ID": 4,
                        "unitName": "BOXES",
                        "price_Per_Unit": 120.00,
                        "created_At": "2026-01-16T00:49:40.2737834"
                    },
                    {
                        "pricing_ID": 2,
                        "level": 2,
                        "uoM_ID": 11,
                        "unitName": "CASE",
                        "price_Per_Unit": 80.00,
                        "created_At": "2026-01-16T00:49:40.2845"
                    },
                    {
                        "pricing_ID": 3,
                        "level": 3,
                        "uoM_ID": 1,
                        "unitName": "PIECES",
                        "price_Per_Unit": 40.00,
                        "created_At": "2026-01-16T00:49:40.2845964"
                    }
                ]
            }
        ],
*/

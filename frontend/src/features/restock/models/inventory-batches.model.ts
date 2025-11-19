export type InventoryBatchesModel = {
  product: product;
  inventory: inventory;
  totalBatches: 0;
};

type product = {
  product_ID: number;
  product_Code: string;
  product_Name: string;
  description: string;
  brand_ID: number;
  category_ID: number;
  variant_ID: number;
  created_At: string;
  updated_At: string;
  brand: brand;
  variant: variant;
  category: category;
};

type brand = {
  brand_Name: string;
  created_At: string;
  updated_At: string;
};

type variant = {
  variant_Name: string;
  created_At: string;
  updated_At: string;
};

type category = {
  category_Name: string;
  created_At: string;
  updated_At: string;
};

type inventory = {
  inventory_ID: number;
  total_Quantity: number;
  inventory_Number: number;
  created_At: string;
  updated_At: string;
};

// {
//         "product": {
//             "product_ID": 1,
//             "product_Code": "PILOT-G2-07-BLK",
//             "product_Name": "Pilot G2 0.7 Gel Pen - Black",
//             "description": "Smooth writing gel ink pen with 0.7mm tip",
//             "brand_ID": 1,
//             "category_ID": 1,
//             "variant_ID": 1,
//             "created_At": "2025-01-01T00:00:00",
//             "updated_At": "2025-01-01T00:00:00",
//             "brand": {
//                 "brand_Name": "Pilot",
//                 "created_At": "2025-01-01T00:00:00",
//                 "updated_At": "2025-01-01T00:00:00"
//             },
//             "variant": {
//                 "variant_Name": "Single Pack",
//                 "created_At": "2025-01-01T00:00:00",
//                 "updated_At": "2025-01-01T00:00:00"
//             },
//             "category": {
//                 "category_Name": "Writing Instruments",
//                 "created_At": "2025-01-01T00:00:00",
//                 "updated_At": "2025-01-01T00:00:00"
//             }
//         },
//         "totalBatches": 0,
//         "inventory": {
//             "inventory_ID": 1,
//             "total_Quantity": 150,
//             "inventory_Number": 1001,
//             "created_At": "2025-01-01T00:00:00",
//             "updated_At": "2025-01-01T00:00:00"
//         }
//     },

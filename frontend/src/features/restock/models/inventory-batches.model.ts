export type InventoryBatchesModel = {
  product: product;
  inventory: inventory;
  totalBatches: number;
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

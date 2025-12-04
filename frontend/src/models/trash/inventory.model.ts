export type InventoryProductModel = {
  product: {
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

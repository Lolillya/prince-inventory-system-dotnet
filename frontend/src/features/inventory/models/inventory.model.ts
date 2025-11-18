export type InventoryModel = {
  product: {
    product_ID: number;
    productCode: string;
    productName: string;
    desc: string;
    brand_id: number;
    category_id: number;
    createdAt: string;
    updatedAt: string;
    brand: brand;
    variant: variant;
  };
};

type brand = {
  brandName: string;
  createdAt: string;
  updatedAt: string;
};

type variant = {
  productId: number;
  variant_Name: string;
  createdAt: string;
  updatedAt: string;
};

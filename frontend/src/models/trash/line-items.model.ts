export type LineItems = {
  lineItem_ID: number;
  product_ID: number;
  restock_ID: number;
  unit: string;
  unit_Price: number;
  sub_Total: number;
  quantity: number;
  product: {
    product_ID: number;
    product_Code: string;
    product_Name: string;
    description: string;
    brand_ID: number;
    category_ID: number;
    variant_ID: number;
    createdAt: string;
    updatedAt: string;
  };
};

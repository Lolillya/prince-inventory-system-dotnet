export type EditProductPayload = {
  productName: string;
  description: string;
  productCode: string;
  brand_ID: number;
  category_Id: number;
  variant_Id: number;
  unitPresets: Array<{
    product_Preset_ID: number;
    low_Stock_Level: number;
    very_Low_Stock_Level: number;
  }>;
};

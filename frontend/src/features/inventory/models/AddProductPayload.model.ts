export type AddProductPayload = {
  productName: string;
  description: string;
  productCode: string;
  brand_ID: number;
  category_Id: number;
  variant_Id: number;
  inventory_Clerk: string;
  unitPresets?: Array<{
    preset_ID: number;
    low_Stock_Level: number;
    very_Low_Stock_Level: number;
  }>;
};

export type ProductFieldsModel = {
  brands: [
    {
      brandName: string;
      brand_ID: number;
    },
  ];
  categories: [
    {
      category_Name: string;
      category_ID: number;
    },
  ];
  variants: [
    {
      variant_Name: string;
      variant_ID: number;
    },
  ];
};

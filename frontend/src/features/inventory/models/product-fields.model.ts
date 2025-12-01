export type ProductFieldsModel = {
  brands: [
    {
      brandName: string;
      Brand_ID: number;
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

export type InvoiceAddNew = {
  product: {
    brand: {
      brandName: string;
      brand_ID: number;
      createdAt: string;
      updatedAt: string;
    };

    variant: {
      product_ID: number;
      variant_ID: number;
      variant_Name: string;
      createdAt: string;
      updatedAt: string;
    };

    category: {
      category_ID: number;
      category_Name: string;
      createdAt: string;
      updatedAt: string;
    };

    // IDs
    brand_ID: number;
    category_ID: number;
    variant_ID: number;
    product_ID: number;

    description: string;
    product_Code: string;
    product_Name: string;
    createdAt: string;
    updatedAt: string;
  };

  units: units[];
};

type units = {
  uoM_Name: string;
  conversion_Factor: number;
  price: number;
};

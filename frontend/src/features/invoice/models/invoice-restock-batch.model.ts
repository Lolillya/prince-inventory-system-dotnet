export type InvoiceRestockBatchModel = {
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
    brand: {
      brand_ID: number;
      brandName: string;
      createdAt: string;
      updatedAt: string;
    };
    variant: {
      variant_ID: number;
      productId: number;
      variant_Name: string;
      createdAt: string;
      updatedAt: string;
    };
    category: {
      category_ID: number;
      categoryName: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  units: units[];
  restockBatch: {
    batch_ID: number;
    batch_Number: number;
    supplier_ID: string;
    createdAt: string;
    updatedAt: string;
  };
};

type units = {
  uoM_Name: string;
  conversion_Factor: number;
  price: number;
};

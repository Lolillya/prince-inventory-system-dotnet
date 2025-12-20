export type InvoiceAddPayloadModel = {
  invoice: {
    item: {
      product: {
        product_ID: number;
        productCode: string;
        productName: string;
        desc: string;
        brand_id: number;
        category_id: number;
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
      };
    };
    // unit: string;
    unit_quantity: number;
    unit_price: number;
    discount: number;
    total: number;
  };
};

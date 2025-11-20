export type InvoiceDTO = {
  LineItem: LineItems[];
  Invoice_Clerk: string | number | undefined;
  Customer_ID: string | number | undefined;
  Term: number | undefined;
  Notes: string;
};

export type LineItems = {
  item: {
    brand: {
      BrandName: string;
      CreatedAt: string;
      UpdatedAt: string;
    };

    product: {
      Product_ID: number;
      ProductCode: string;
      ProductName: string;
      Description: string;
      Brand_Id: number;
      Category_Id: number;
      CreatedAt: string;
      UpcatedAt: string;
    };

    variant: {
      ProductId: number;
      VariantName: string;
      CreatedAt: string;
      UpcatedAt: string;
    };
  };
  total: number;
  unit: string;
  unit_price: number;
  unit_quantity: number;
};

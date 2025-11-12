export type RestockItemsModel = {
  restock_Id: number;
  grand_total: number;
  supplier: {
    company_Name: string;
  };
  line_Items: [
    {
      product: {
        product_ID: number;
        product_Name: string;
      };
    },
  ];
};

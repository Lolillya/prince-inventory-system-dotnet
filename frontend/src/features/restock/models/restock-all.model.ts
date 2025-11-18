export type RestockAllModel = {
  grand_total: number;
  restock_Id: number;
  line_Items: RestockLineItems[];
  supplier: supplier;
};

type RestockLineItems = {
  lineItem_ID: number;
  product_ID: number;
  product: product;
  unit: string;
  unit_Price: number;
  sub_Total: number;
  quantity: number;
};

type product = {
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

type supplier = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

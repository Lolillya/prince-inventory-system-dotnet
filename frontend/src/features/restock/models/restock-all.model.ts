export type RestockAllModel = {
  restock_Id: number;
  restock_Number: string;
  restock_Notes: string;
  clerk: Clerk;
  supplier: Supplier;
  created_At: string;
  updated_At: string;
  line_Items: LineItem[];
};

type Clerk = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type Supplier = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

type LineItem = {
  line_Item_ID: number;
  batch_Id: number;
  batch_Number: number;
  product: Product;
  base_Unit: Unit;
  base_Unit_Price: number;
  base_Unit_Quantity: number;
  unit_Conversions: Unit_Conversions[];
};

type Product = {
  product_ID: number;
  product_Code: string;
  product_Name: string;
  description: string;
  brand: Brand;
  category: Category;
  variant: Variant;
};

type Brand = {
  brand_ID: number;
  brandName: string;
};

type Category = {
  category_ID: number;
  category_Name: string;
};

type Variant = {
  variant_ID: number;
  variant_Name: string;
};

type Unit_Conversions = {
  product_UOM_Id: number;
  unit: Unit;
  parent_UOM_ID: number;
  conversion_Factor: number;
  unit_Price: number;
};

type Unit = {
  uom_ID: number;
  uom_Name: string;
};

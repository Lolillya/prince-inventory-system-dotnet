export type InvoiceRestockBatchModel = {
  batches: Batches[];
  product: Product;
};

type Batches = {
  baseUnit: BaseUnit;
  batch_ID: number;
  batch_Number: number;
  restock: Restock;
  supplier: Supplier;
  unitConversions: UnitConversion[];
  createdAt: string;
  updatedAt: string;
};

type BaseUnit = {
  unit_Price: number;
  unit_Quantity: number;
  uoM_ID: number;
  uoM_Name: string;
};

type Restock = {
  restock_ID: number;
  restock_Number: string;
  createdAt: string;
  updatedAt: string;
};

type Supplier = {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  supplpier_ID: number;
};

type UnitConversion = {
  conversion_Factor: number;
  parent_UOM_ID: number;
  parent_UOM_Name: string;
  product_UOM_Id: number;
  unit_Price: number;
  uoM_ID: number;
  uoM_Name: string;
};

type Product = {
  brand: Brand;
  brand_ID: number;
  category: Category;
  category_ID: number;
  createdAt: string;
  description: string;
  product_Code: string;
  product_ID: number;
  product_Name: string;
  updatedAt: string;
  variant: Variant;
  variant_ID: number;
};

type Brand = {
  brandName: string;
  brand_ID: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  categoryName: string;
  category_ID: number;
  createdAt: string;
  updatedAt: string;
};

type Variant = {
  createdAt: string;
  updatedAt: string;
  productId: number;
  variant_ID: number;
  variant_Name: string;
};

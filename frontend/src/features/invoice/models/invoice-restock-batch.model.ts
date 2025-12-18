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
    } | null;
    variant: {
      variant_ID: number;
      productId: number;
      variant_Name: string;
      createdAt: string;
      updatedAt: string;
    } | null;
    category: {
      category_ID: number;
      categoryName: string;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
  batches: Batch[];
};

type Batch = {
  batch_ID: number;
  batch_Number: number;
  restock: {
    restock_ID: number;
    restock_Number: string;
    createdAt: string;
    updatedAt: string;
  };
  supplier: {
    supplier_ID: string;
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
  } | null;
  baseUnit: {
    uoM_ID: number;
    uoM_Name: string;
    unit_Price: number;
    unit_Quantity: number;
  } | null;
  unitConversions: UnitConversion[];
  createdAt: string;
  updatedAt: string;
};

type UnitConversion = {
  product_UOM_Id: number;
  uoM_ID: number;
  uoM_Name: string;
  parent_UOM_ID: number | null;
  parent_UoM_Name: string | null;
  conversion_Factor: number;
  unit_Price: number;
};

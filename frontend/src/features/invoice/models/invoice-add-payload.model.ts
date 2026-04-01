export type InvoiceAddPayloadModel = {
  invoice: {
    product: Product;
    brand: Brand;
    category: Category;
    variant: Variant;
    unit: string;
    preset_ID: number | null;
    supplement_Preset_IDs?: number[];
    uom_ID: number;
    unit_quantity: number;
    unit_price: number;
    discount: number;
    total: number;
    isDiscountPercentage: boolean;
    invoice_Clerk: string;
    term: number;
  };
};

type Product = {
  quantity: number;
  product_ID: number;
  product_Code: string;
  product_Name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type Brand = {
  brandName: string;
  brand_ID: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  category_ID: number;
  category_Name: string;
  createdAt: string;
  updatedAt: string;
};

type Variant = {
  variant_ID: number;
  variant_Name: string;
  createdAt: string;
  updatedAt: string;
};

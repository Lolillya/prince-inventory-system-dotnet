export type InvoiceAddPayloadModel = {
  invoice: {
    product: Product;
    unit: string;
    unit_quantity: number;
    unit_price: number;
    discount: number;
    total: number;
    isDiscountPercentage: boolean;
  };
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

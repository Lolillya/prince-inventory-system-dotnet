export type RestockModel = {
  restock: {
    items: {
      product: {
        product_ID: number;
        productCode: string;
        productName: string;
        desc: string;
        brand_id: number;
        category_id: number;
        createdAt: string;
        updatedAt: string;
      };
      variant: {
        productId: number;
        variant_Name: string;
        createdAt: string;
        updatedAt: string;
      };

      brand: {
        brandName: string;
        createdAt: string;
        updatedAt: string;
      };
    };
    unit: string;
    unit_quantity: number;
    unit_price: number;
    total: number;
    unitConversions?: UnitConversion[];
  };
};

export type UnitConversion = {
  id: string; // temporary ID for frontend tracking
  fromUnit: string;
  toUnit: string;
  conversionFactor: number; // how many toUnits are in one fromUnit
  quantity: number; // quantity to be restocked at this level
  price: number; // price per unit at this level
};

type ProductUnitConversion = {
  productId: number;
  variantName: string;
  conversions: UnitConversion[];
};

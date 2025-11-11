export type UnitConversion = {
  id: string; // temporary ID for frontend tracking
  fromUnit: string;
  toUnit: string;
  conversionFactor: number; // how many toUnits are in one fromUnit
  quantity: number; // quantity to be restocked at this level
  price: number; // price per unit at this level
};

export type ProductUnitConversion = {
  productId: number;
  variantName: string;
  conversions: UnitConversion[];
};

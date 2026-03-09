export interface UnitPriceData {
  unitName: string;
  price: number;
}

export interface ProductPricingData {
  product_ID: number;
  unitPrices: UnitPriceData[];
}

export interface AssignProductsToPresetPayload {
  preset_ID: number;
  product_IDs: number[];
  pricingData?: ProductPricingData[];
}

export interface AssignProductsToPresetResponse {
  message: string;
  assigned_count: number;
  skipped_count: number;
}

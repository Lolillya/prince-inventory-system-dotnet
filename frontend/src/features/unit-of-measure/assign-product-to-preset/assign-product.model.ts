export interface AssignProductsToPresetPayload {
  preset_ID: number;
  product_IDs: number[];
}

export interface AssignProductsToPresetResponse {
  message: string;
  assigned_count: number;
  skipped_count: number;
}

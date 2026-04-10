import { api } from "@/features/api/API.service";
import axios from "axios";

export interface UpdatePresetPricingPayload {
  preset_ID: number;
  product_ID: number;
  unitPrices: { unitName: string; price: number }[];
}

export const updatePresetPricing = async (
  payload: UpdatePresetPricingPayload,
): Promise<void> => {
  await axios.put(api + "unit-presets/update-pricing", payload);
};

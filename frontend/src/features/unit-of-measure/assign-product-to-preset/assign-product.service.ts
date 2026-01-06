import { api } from "@/features/api/API.service";
import axios from "axios";
import {
  AssignProductsToPresetPayload,
  AssignProductsToPresetResponse,
} from "./assign-product.model";

export const assignProductsToPreset = async (
  payload: AssignProductsToPresetPayload
): Promise<AssignProductsToPresetResponse> => {
  const response = await axios.post<AssignProductsToPresetResponse>(
    api + "unit-presets/assign-products",
    payload
  );
  return response.data;
};

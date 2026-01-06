import { api } from "@/features/api/API.service";
import {
  CreateUnitPresetPayload,
  CreateUnitPresetResponse,
} from "./create-unit-preset.model";
import axios from "axios";

export const createUnitPreset = async (
  payload: CreateUnitPresetPayload
): Promise<CreateUnitPresetResponse> => {
  const response = await axios.post<CreateUnitPresetResponse>(
    api + "unit-presets",
    payload
  );
  return response.data;
};

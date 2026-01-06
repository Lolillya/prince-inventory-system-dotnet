import { UnitPresetLevel } from "./get-unit-presets.model";
import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const GetAllUnitPresets = async () => {
  try {
    const data = await axios.get<UnitPresetLevel[]>(api + "unit-presets");
    return data;
  } catch (e) {
    handleError(e);
  }
};

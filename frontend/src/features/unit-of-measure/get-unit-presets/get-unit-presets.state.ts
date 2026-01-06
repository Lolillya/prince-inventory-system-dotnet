import { useQuery } from "@tanstack/react-query";
import { UnitPresetLevel } from "./get-unit-presets.model";
import { GetAllUnitPresets } from "./get-unit-presets.service";

const UnitPresetKey = ["unit-preset"];

export const useUnitPresetQuery = () => {
  return useQuery<UnitPresetLevel[]>({
    queryKey: UnitPresetKey,
    queryFn: async () => {
      const res = await GetAllUnitPresets();
      if (!res) throw new Error("Failed to fetch unit presets");
      return res.data;
    },
  });
};

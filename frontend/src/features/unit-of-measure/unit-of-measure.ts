import { UnitModel } from "@/models/uom.model";
import { useQuery } from "@tanstack/react-query";
import { GetAllUnits } from "./get-all-uom.service";

export const UnitOfMeasureQurey = () => {
  return useQuery<UnitModel[]>({
    queryKey: ["unit-model"],
    queryFn: async () => {
      const response = await GetAllUnits();
      if (!response) throw new Error("Failed to fetch product unit data");
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

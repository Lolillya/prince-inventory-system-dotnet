import { useQuery } from "@tanstack/react-query";
import { GetInventory } from "./get-inventory.service";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";

export const UseInventoryQuery = () => {
  return useQuery<InventoryProductModel[]>({
    queryKey: ["inventory-products"],
    queryFn: async () => {
      const response = await GetInventory();
      if (!response) throw new Error("Failed to fetch inventory");
      const inventoryData = response.data as unknown as InventoryProductModel[];

      const processedData = inventoryData.map((product) => {
        const hasUnitPresets =
          product.unitPresets && product.unitPresets.length > 0;

        let isSetupComplete = false;
        if (hasUnitPresets) {
          isSetupComplete = product.unitPresets.every(
            (up) =>
              up.presetPricing &&
              up.presetPricing.length > 0 &&
              up.presetPricing.every((pp) => pp.price_Per_Unit > 0),
          );
        }

        return {
          ...product,
          isSetupComplete: isSetupComplete,
        };
      });

      return processedData;
    },
    staleTime: 60 * 1000,
  });
};

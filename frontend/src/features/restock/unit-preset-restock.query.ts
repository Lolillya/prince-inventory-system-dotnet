import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  UnitPresetRestockItem,
  UnitPresetRestockPayload,
} from "./models/unit-preset-restock.model";
import { unitPresetRestockService } from "./unit-preset-restock.service";
import { toast } from "sonner";

const UNIT_PRESET_RESTOCK_KEY = ["unit-preset-restock"];

/**
 * Hook to get the selected restock items
 */
export const useUnitPresetRestockItems = () => {
  return useQuery<UnitPresetRestockItem[]>({
    queryKey: UNIT_PRESET_RESTOCK_KEY,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

/**
 * Hook to manage unit preset restock operations
 */
export const useUnitPresetRestock = () => {
  const queryClient = useQueryClient();

  /**
   * Add product to restock list
   */
  const addProduct = (product: UnitPresetRestockItem) => {
    queryClient.setQueryData<UnitPresetRestockItem[]>(
      UNIT_PRESET_RESTOCK_KEY,
      (old = []) => {
        // Check if product already exists
        const exists = old.some(
          (item) => item.product.product_ID === product.product.product_ID
        );
        return exists ? old : [...old, product];
      }
    );
  };

  /**
   * Remove product from restock list
   */
  const removeProduct = (productId: number) => {
    queryClient.setQueryData<UnitPresetRestockItem[]>(
      UNIT_PRESET_RESTOCK_KEY,
      (old = []) => {
        return old.filter((item) => item.product.product_ID !== productId);
      }
    );
  };

  /**
   * Select a preset for a product
   */
  const selectPreset = (productId: number, presetId: number) => {
    queryClient.setQueryData<UnitPresetRestockItem[]>(
      UNIT_PRESET_RESTOCK_KEY,
      (old = []) => {
        return old.map((item) => {
          if (item.product.product_ID !== productId) return item;

          const preset = item.unitPresets.find((p) => p.preset_ID === presetId);
          if (!preset) return item;

          // Initialize pricing for all levels with 0
          const levelPricing = preset.preset.presetLevels.map((level) => ({
            level: level.level,
            uom_ID: level.uoM_ID || level.unitOfMeasure.uom_ID,
            uom_Name: level.unitOfMeasure.uom_Name,
            price_Per_Unit: 0,
          }));

          return {
            ...item,
            selectedPreset: {
              preset_ID: presetId,
              main_Unit_Quantity: 0,
              levelPricing,
            },
          };
        });
      }
    );
  };

  /**
   * Update main unit quantity for a product
   */
  const updateMainQuantity = (productId: number, quantity: number) => {
    queryClient.setQueryData<UnitPresetRestockItem[]>(
      UNIT_PRESET_RESTOCK_KEY,
      (old = []) => {
        return old.map((item) => {
          if (item.product.product_ID !== productId || !item.selectedPreset) {
            return item;
          }

          return {
            ...item,
            selectedPreset: {
              ...item.selectedPreset,
              main_Unit_Quantity: quantity,
            },
          };
        });
      }
    );
  };

  /**
   * Update pricing for a specific level
   */
  const updateLevelPricing = (
    productId: number,
    level: number,
    price: number
  ) => {
    queryClient.setQueryData<UnitPresetRestockItem[]>(
      UNIT_PRESET_RESTOCK_KEY,
      (old = []) => {
        return old.map((item) => {
          if (item.product.product_ID !== productId || !item.selectedPreset) {
            return item;
          }

          return {
            ...item,
            selectedPreset: {
              ...item.selectedPreset,
              levelPricing: item.selectedPreset.levelPricing.map((lp) =>
                lp.level === level ? { ...lp, price_Per_Unit: price } : lp
              ),
            },
          };
        });
      }
    );
  };

  /**
   * Clear all restock items
   */
  const clearAll = () => {
    queryClient.setQueryData<UnitPresetRestockItem[]>(
      UNIT_PRESET_RESTOCK_KEY,
      []
    );
  };

  /**
   * Get payload ready for API submission
   */
  const getPayload = (): {
    lineItems: {
      product_ID: number;
      preset_ID: number;
      main_Unit_Quantity: number;
      levelPricing: {
        level: number;
        uom_ID: number;
        price_Per_Unit: number;
      }[];
    }[];
  } => {
    const items =
      queryClient.getQueryData<UnitPresetRestockItem[]>(
        UNIT_PRESET_RESTOCK_KEY
      ) || [];

    console.log(
      "Items in state before getPayload:",
      JSON.stringify(items, null, 2)
    );

    const lineItems = items
      .filter((item) => item.selectedPreset)
      .map((item) => ({
        product_ID: item.product.product_ID,
        preset_ID: item.selectedPreset!.preset_ID,
        main_Unit_Quantity: item.selectedPreset!.main_Unit_Quantity,
        levelPricing: item.selectedPreset!.levelPricing.map((lp) => ({
          level: lp.level,
          uom_ID: lp.uom_ID,
          price_Per_Unit: lp.price_Per_Unit,
        })),
      }));

    return { lineItems };
  };

  return {
    addProduct,
    removeProduct,
    selectPreset,
    updateMainQuantity,
    updateLevelPricing,
    clearAll,
    getPayload,
  };
};

/**
 * Mutation hook to create unit preset restock
 */
export const useCreateUnitPresetRestock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitPresetRestockPayload) =>
      unitPresetRestockService.create(payload),
    onSuccess: (data) => {
      toast.success(
        `Restock created successfully! Restock Number: ${data.restock_Number}`
      );
      // Clear the restock items
      queryClient.setQueryData<UnitPresetRestockItem[]>(
        UNIT_PRESET_RESTOCK_KEY,
        []
      );
      // Invalidate inventory to refetch updated quantities
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-with-batches"] });
    },
    onError: (error) => {
      toast.error("Failed to create restock. Please try again.");
      console.error("Create restock error:", error);
    },
  });
};

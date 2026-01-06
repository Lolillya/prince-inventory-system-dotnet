import { useQuery, useQueryClient } from "@tanstack/react-query";

interface SelectedProductsState {
  selectedPresetId: number | null;
  selectedProductIds: number[];
}

const AssignProductToPresetKey = ["assign-product-to-preset"];

export const useAssignProductToPresetState = () => {
  return useQuery<SelectedProductsState>({
    queryKey: AssignProductToPresetKey,
    queryFn: async () => {
      return {
        selectedPresetId: null,
        selectedProductIds: [],
      };
    },
    enabled: false,
  });
};

export const useSetAssignProductToPresetState = () => {
  const queryClient = useQueryClient();

  return (data: SelectedProductsState) => {
    queryClient.setQueryData<SelectedProductsState>(
      AssignProductToPresetKey,
      data
    );
  };
};

export const useToggleProductSelection = () => {
  const queryClient = useQueryClient();

  return (productId: number) => {
    const currentData = queryClient.getQueryData<SelectedProductsState>(
      AssignProductToPresetKey
    );

    if (currentData) {
      const isSelected = currentData.selectedProductIds.includes(productId);
      const newSelectedIds = isSelected
        ? currentData.selectedProductIds.filter((id) => id !== productId)
        : [...currentData.selectedProductIds, productId];

      queryClient.setQueryData<SelectedProductsState>(
        AssignProductToPresetKey,
        {
          ...currentData,
          selectedProductIds: newSelectedIds,
        }
      );
    }
  };
};

export const useClearProductSelection = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.setQueryData<SelectedProductsState>(AssignProductToPresetKey, {
      selectedPresetId: null,
      selectedProductIds: [],
    });
  };
};

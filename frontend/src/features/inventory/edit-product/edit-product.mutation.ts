--- frontend / src / features / inventory / edit - product / edit - product.mutation.ts(原始)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditProductPayload } from "./edit-product-payload.model";
import { editProductService } from "./edit-product.service";
import { toast } from "sonner";

export const useEditProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditProductPayload) => editProductService(payload),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      // Invalidate inventory query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["selected-product"] });
    },
    onError: (error) => {
      toast.error("Failed to update product");
      console.error("Edit product error:", error);
    },
  });
};

+++ frontend / src / features / inventory / edit - product / edit - product.mutation.ts(修改后)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditProductPayload } from "./edit-product-payload.model";
import { editProductService } from "./edit-product.service";
import { toast } from "sonner";

export const useEditProductMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditProductPayload) => editProductService(payload),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      // Invalidate inventory query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["selected-product"] });

      // Call the success callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      toast.error("Failed to update product");
      console.error("Edit product error:", error);
    },
  });
};
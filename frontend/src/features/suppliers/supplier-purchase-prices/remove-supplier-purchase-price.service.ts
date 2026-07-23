import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";

export type RemovePriceItem = {
  product_ID: number;
  preset_ID: number;
};

const removeSupplierPurchasePrice = async (
  supplierId: string,
  item: RemovePriceItem,
) => {
  try {
    const data = await axios.delete(
      api + `suppliers/${supplierId}/purchase-prices`,
      { data: item },
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

export const useRemoveSupplierPurchasePriceMutation = (supplierId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: RemovePriceItem) =>
      removeSupplierPurchasePrice(supplierId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-purchase-prices", supplierId],
      });
    },
  });
};

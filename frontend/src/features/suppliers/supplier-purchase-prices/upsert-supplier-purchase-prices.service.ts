import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";
import { SupplierPurchasePriceModel } from "./supplier-purchase-prices.model";

export type UpsertPriceItem = {
  product_ID: number;
  preset_ID: number;
  price_Per_Unit: number;
};

const upsertSupplierPurchasePrices = async (
  supplierId: string,
  items: UpsertPriceItem[],
) => {
  try {
    const data = await axios.post<SupplierPurchasePriceModel[]>(
      api + `suppliers/${supplierId}/purchase-prices`,
      items,
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

export const useUpsertSupplierPurchasePricesMutation = (supplierId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: UpsertPriceItem[]) =>
      upsertSupplierPurchasePrices(supplierId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supplier-purchase-prices", supplierId],
      });
    },
  });
};

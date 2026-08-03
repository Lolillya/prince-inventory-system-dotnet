import axios from "axios";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";
import { PurchasePriceAuditLogModel } from "./supplier-purchase-prices.model";

export const GetSupplierPurchasePriceHistory = async (
  supplierId: string,
  productId: number,
  presetId: number,
) => {
  try {
    const data = await axios.get<PurchasePriceAuditLogModel[]>(
      api + `suppliers/${supplierId}/purchase-prices/history`,
      { params: { productId, presetId } },
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

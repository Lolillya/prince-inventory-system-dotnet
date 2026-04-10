import axios from "axios";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";
import { SupplierPurchasePriceModel } from "./supplier-purchase-prices.model";

export const GetSupplierPurchasePrices = async (supplierId: string) => {
  try {
    const data = await axios.get<SupplierPurchasePriceModel[]>(
      api + `suppliers/${supplierId}/purchase-prices`,
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

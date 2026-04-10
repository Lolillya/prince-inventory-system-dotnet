import axios from "axios";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";
import { ProductWithPresetsModel } from "./supplier-purchase-prices.model";

export const GetProductsWithPresets = async () => {
  try {
    const data = await axios.get<ProductWithPresetsModel[]>(
      api + "products/with-presets",
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

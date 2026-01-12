import axios from "axios";
import { handleError } from "../../../helpers/error-handler.helper";
import { api } from "../../api/API.service";
import { EditProductPayload } from "./edit-product-payload.model";

export const editProductService = async (payload: EditProductPayload) => {
  try {
    const { data } = await axios.post(
      api + "update-inventory-product",
      payload
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

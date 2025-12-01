import axios from "axios";
import { handleError } from "../../helpers/error-handler.helper";
import { api } from "../api/API.service";
import { AddProductPayload } from "./models/AddProductPayload.model";

export const addProductService = async (payload: AddProductPayload) => {
  try {
    const { data } = await axios.post(api + "add-product", payload);
    return data;
  } catch (err) {
    handleError(err);
  }
};

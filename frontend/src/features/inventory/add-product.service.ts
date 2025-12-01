import axios from "axios";
import { handleError } from "../../helpers/error-handler.helper";
import { api } from "../api/API.service";

export type AddProductPayload = {
  productName: string;
  description: string;
  productCode: string;
  brand_Id: number;
  category_Id: number;
  variant_Id: number;
};

export const addProductService = async (payload: AddProductPayload) => {
  try {
    const { data } = await axios.post(api + "add-product", payload);
    return data;
  } catch (err) {
    handleError(err);
  }
};

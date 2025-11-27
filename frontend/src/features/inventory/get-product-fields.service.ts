import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { ProductFieldsModel } from "./models/product-fields.model";

export const GetProductFields = async () => {
  try {
    const data = axios.get<ProductFieldsModel[]>(api + "get-product-fields/");
    return data;
  } catch (err) {
    handleError(err);
  }
};

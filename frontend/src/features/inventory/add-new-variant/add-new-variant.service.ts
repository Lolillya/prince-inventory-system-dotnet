import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const addNewVariantService = async (payload: { name: string }) => {
  try {
    const res = await axios.post(api + "add-variant", payload);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

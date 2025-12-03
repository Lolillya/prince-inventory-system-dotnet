import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const addNewBrandService = async (brandName: string) => {
  try {
    const res = await axios.post(api + "add-brand", { brandName });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const addNewCategoryService = async (categoryName: string) => {
  try {
    const res = await axios.post(api + "add-category", { categoryName });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

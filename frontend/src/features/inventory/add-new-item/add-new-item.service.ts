import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const addNewItemService = async (itemName: string) => {
  try {
    const res = await axios.post(api + "add-item", { itemName });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

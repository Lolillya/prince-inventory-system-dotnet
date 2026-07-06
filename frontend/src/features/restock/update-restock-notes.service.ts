import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";

export const updateRestockNotes = async (restockId: number, notes: string) => {
  try {
    const response = await axios.patch(api + `restock/${restockId}/notes`, {
      notes,
    });
    return response.data;
  } catch (e) {
    handleError(e);
  }
};

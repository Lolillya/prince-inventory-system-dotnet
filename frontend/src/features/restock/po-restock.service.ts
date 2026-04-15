import axios from "axios";
import { api } from "../api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import { PORestockPayload, PORestockResponse } from "./models/po-restock.model";

export const createPORestock = async (
  payload: PORestockPayload,
): Promise<PORestockResponse> => {
  try {
    const response = await axios.post<PORestockResponse>(
      api + "restock/po-restock",
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

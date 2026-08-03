import axios from "axios";
import { api } from "../api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import { PORestockHistoryRecord } from "./models/po-restock-history.model";

export const getRestocksByPurchaseOrder = async (purchaseOrderId: number) => {
  try {
    const response = await axios.get<PORestockHistoryRecord[]>(
      api + `restock/by-purchase-order/${purchaseOrderId}`,
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const poRestockHistoryService = {
  getRestocksByPurchaseOrder,
};

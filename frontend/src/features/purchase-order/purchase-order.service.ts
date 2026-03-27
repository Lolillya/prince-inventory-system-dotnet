import axios from "axios";
import { api } from "../api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import {
  PurchaseOrderCreatePayload,
  PurchaseOrderRecord,
  PurchaseOrderUpdateStatusPayload,
} from "./purchase-order.model";

export const createPurchaseOrder = async (
  payload: PurchaseOrderCreatePayload,
) => {
  try {
    const response = await axios.post(api + "purchase-orders", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const getPurchaseOrdersBySupplier = async (supplierId: string) => {
  try {
    const response = await axios.get<PurchaseOrderRecord[]>(
      api + `purchase-orders/supplier/${supplierId}`,
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const updatePurchaseOrderStatus = async (
  purchaseOrderId: number,
  payload: PurchaseOrderUpdateStatusPayload,
) => {
  try {
    const response = await axios.put(
      api + `purchase-orders/${purchaseOrderId}/status`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const purchaseOrderService = {
  createPurchaseOrder,
  getPurchaseOrdersBySupplier,
  updatePurchaseOrderStatus,
};

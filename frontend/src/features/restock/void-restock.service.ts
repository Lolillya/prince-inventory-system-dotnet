import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";

export type VoidRestockResponse = {
  message: string;
  restockId: number;
  restockNumber: string;
  inventoryDeductions: {
    product_ID: number;
    quantity: number;
  }[];
  presetDeductions: {
    product_ID: number;
    preset_ID: number;
    quantity: number;
  }[];
};

export type VoidRestockPayload = {
  restockId: number;
  reason: string;
  password: string;
};

export type InsufficientVoidRestockItem = {
  productId: number;
  productName: string;
  availableQuantity: number;
  requiredQuantity: number;
};

export class InsufficientInventoryToVoidError extends Error {
  insufficientItems: InsufficientVoidRestockItem[];

  constructor(message: string, insufficientItems: InsufficientVoidRestockItem[]) {
    super(message);
    this.name = "InsufficientInventoryToVoidError";
    this.insufficientItems = insufficientItems;
  }
}

export const voidRestock = async (
  payload: VoidRestockPayload,
): Promise<VoidRestockResponse> => {
  try {
    const response = await axios.put<VoidRestockResponse>(
      `${api}restock/void/${payload.restockId}`,
      {
        reason: payload.reason,
        password: payload.password,
      },
    );

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409 &&
      Array.isArray(error.response.data?.insufficientItems)
    ) {
      throw new InsufficientInventoryToVoidError(
        error.response.data.message ??
          "There isn't enough inventory available to fully reverse this restock.",
        error.response.data.insufficientItems,
      );
    }

    handleError(error);
    throw error;
  }
};

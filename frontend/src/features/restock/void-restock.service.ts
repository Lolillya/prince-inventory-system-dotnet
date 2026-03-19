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

export const voidRestock = async (
  restockId: number,
): Promise<VoidRestockResponse> => {
  try {
    const response = await axios.put<VoidRestockResponse>(
      `${api}restock/void/${restockId}`,
    );

    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

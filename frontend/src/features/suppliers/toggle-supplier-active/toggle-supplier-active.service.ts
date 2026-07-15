import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export type ToggleSupplierActiveResponse = {
  userId: string;
  isActive: boolean;
};

export const ToggleSupplierActiveService = async (
  userId: string,
  password: string,
) => {
  try {
    const data = await axios.put<ToggleSupplierActiveResponse>(
      api + "toggle-user-active",
      { userId, password },
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

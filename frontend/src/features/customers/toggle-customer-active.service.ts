import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export type ToggleCustomerActiveResponse = {
  userId: string;
  isActive: boolean;
};

// Deactivation/reactivation for a customer reuses the same generic
// "toggle-user-active" endpoint the supplier feature uses — it operates on
// any user row by id and verifies the REQUESTING (admin) user's password.
export const ToggleCustomerActiveService = async (
  userId: string,
  password: string,
) => {
  try {
    const data = await axios.put<ToggleCustomerActiveResponse>(
      api + "toggle-user-active",
      { userId, password },
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

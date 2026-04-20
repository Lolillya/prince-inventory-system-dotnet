import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";

export const ChangeEmployeePasswordService = async (
  userId: string,
  newPassword: string,
) => {
  try {
    const data = await axios.put(api + "change-password-by-id", {
      userId,
      newPassword,
    });
    return data;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

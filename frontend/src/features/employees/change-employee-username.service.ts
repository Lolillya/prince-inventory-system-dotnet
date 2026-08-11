import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";

export const ChangeEmployeeUsernameService = async (
  userId: string,
  newUsername: string,
) => {
  try {
    const data = await axios.put(api + "change-username-by-id", {
      userId,
      newUsername,
    });
    return data;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

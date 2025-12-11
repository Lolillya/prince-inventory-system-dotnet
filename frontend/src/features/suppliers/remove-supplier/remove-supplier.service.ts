import { api } from "@/features/api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const DeleteUserService = async (userId: string) => {
  console.log("DeleteUserService userId:", userId);
  try {
    const data = await axios.put(api + "delete-user-by-id", { userId });
    return data;
  } catch (err) {
    handleError(err);
  }
};

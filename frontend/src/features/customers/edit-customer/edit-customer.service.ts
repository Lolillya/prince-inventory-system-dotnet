import { api } from "@/features/api/API.service";
import { UserModel } from "@/features/auth-login/models/user.model";
import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";

export const EditCustomerService = async (payload: UserModel) => {
  try {
    const data = await axios.put<UserModel>(api + "edit-user-by-id", payload);
    return data;
  } catch (err) {
    handleError(err);
  }
};

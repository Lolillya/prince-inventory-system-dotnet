import { api } from "@/features/api/API.service";
import { UserModel } from "@/features/auth-login/models/user.model";
import { handleError } from "@/helpers/error-handler.helper";

import axios from "axios";

export const AddNewSupplierService = async (payload: UserModel) => {
  // Generate random username and password
  const generatedUsername = `${payload.firstName.toLowerCase()}.${payload.lastName.toLowerCase()}.${Math.floor(Math.random() * 10000)}`;
  const generatedPassword =
    Math.random().toString(36).slice(-12) +
    Math.random().toString(36).slice(-12).toUpperCase() +
    Math.floor(Math.random() * 100);

  const finalPayload = {
    ...payload,
    username: generatedUsername,
    password: generatedPassword,
  };

  console.log("Generated credentials:", {
    username: generatedUsername,
    password: generatedPassword,
  });

  try {
    const data = await axios.post(api + "auth/register", finalPayload);
    return data;
  } catch (err) {
    handleError(err);
  }
};

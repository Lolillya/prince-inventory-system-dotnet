import axios from "axios";
import { UserClientModel } from "../../models/user-client.model";
import { api } from "../api/API.service";
import { handleError } from "../../helpers/error-handler.helper";

export const GetAllEmployees = async () => {
  try {
    const data = await axios.get<UserClientModel[]>(api + "users/?id=1&id=2");
    return data;
  } catch (err) {
    handleError(err);
  }
};

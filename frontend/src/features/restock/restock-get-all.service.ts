import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { RestockAllModel } from "./models/restock-all.model";

export const GetAllRestocks = async () => {
  try {
    const data = await axios.get<RestockAllModel[]>(api + "restock/get-all");
    return data;
  } catch (e) {
    handleError(e);
  }
};

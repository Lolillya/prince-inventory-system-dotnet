import { handleError } from "@/helpers/error-handler.helper";
import { UnitModel } from "@/models/uom.model";
import axios from "axios";
import { api } from "../api/API.service";

export const GetAllUnits = async () => {
  try {
    const data = await axios.get<UnitModel[]>(api + "uom-get-all");
    return data;
  } catch (e) {
    handleError(e);
  }
};

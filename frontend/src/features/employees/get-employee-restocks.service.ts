import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { RestockAllModel } from "../restock/models/restock-all.model";

export const GetEmployeeRestocks = async (employeeId: string) => {
  try {
    const data = await axios.get<RestockAllModel[]>(
      api + `employees/${employeeId}/restocks`,
    );
    return data;
  } catch (e) {
    handleError(e);
  }
};

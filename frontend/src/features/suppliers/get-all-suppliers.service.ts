import axios from "axios";
import { api } from "../api/API.service";
import { handleError } from "../../helpers/error-handler.helper";
import { SupplierDataModel } from "./get-all-suppliers.model";

export const GetAllSuppliers = async () => {
  try {
    const data = await axios.get<SupplierDataModel[]>(
      api + "suppliers/restocks",
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

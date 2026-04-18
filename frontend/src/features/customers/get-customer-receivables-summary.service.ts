import axios from "axios";
import { CustomerReceivablesSummary } from "./models/customer-receivables-summary.model";
import { api } from "../api/API.service";
import { handleError } from "@/helpers/error-handler.helper";

export const GetCustomerReceivablesSummary = async () => {
  try {
    const data = await axios.get<CustomerReceivablesSummary[]>(
      api + "customers/receivables-summary",
    );
    return data;
  } catch (e) {
    handleError(e);
  }
};

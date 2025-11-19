import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { InvoiceAllModel } from "./models/invoice-all.model";

export const GetAllInvoices = async () => {
  try {
    const data = await axios.get<InvoiceAllModel[]>(api + "invoice/get-all");
    return data;
  } catch (e) {
    handleError(e);
  }
};

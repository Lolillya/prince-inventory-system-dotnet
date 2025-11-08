import { handleError } from "@/helpers/error-handler.helper";
import { InvoiceItemsModel } from "@/models/invoice-items.model";
import axios from "axios";
import { api } from "../api/API.service";

export const GetAllInvoices = async () => {
  try {
    const data = await axios.get<InvoiceItemsModel[]>(api + "invoice/get-all");
    return data;
  } catch (e) {
    handleError(e);
  }
};

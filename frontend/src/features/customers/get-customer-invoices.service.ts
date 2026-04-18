import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { InvoiceAllModel } from "../invoice/models/invoice-all.model";

export const GetCustomerInvoices = async (customerId: string) => {
  try {
    const data = await axios.get<InvoiceAllModel[]>(
      api + `customers/${customerId}/invoices`,
    );
    return data;
  } catch (e) {
    handleError(e);
  }
};

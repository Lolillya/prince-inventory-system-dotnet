import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { InvoiceAllModel } from "../invoice/models/invoice-all.model";

export const GetEmployeeInvoices = async (employeeId: string) => {
  try {
    const data = await axios.get<InvoiceAllModel[]>(
      api + `employees/${employeeId}/invoices`,
    );
    return data;
  } catch (e) {
    handleError(e);
  }
};

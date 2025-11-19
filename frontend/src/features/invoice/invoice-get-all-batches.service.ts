import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { InvoiceRestockBatchModel } from "./models/invoice-restock-batch.model";

export const GetAllInvoiceBatch = async () => {
  try {
    const data = await axios.get<InvoiceRestockBatchModel[]>(
      api + "invoice/restock-batches"
    );
    return data;
  } catch (e) {
    handleError(e);
  }
};

import { handleError } from "@/helpers/error-handler.helper";
import { InvoiceItemsModel_2 } from "@/models/invoice-restockBatch.model";
import axios from "axios";
import { api } from "../api/API.service";

export const GetAllInvoiceBatch = async () => {
  try {
    const data = await axios.get<InvoiceItemsModel_2[]>(
      api + "invoice/get-batches"
    );
    return data;
  } catch (e) {
    handleError(e);
  }
};

import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import {
  InvoicePaymentModel,
  RecordPaymentPayload,
  InvalidatePaymentPayload,
} from "./models/invoice-payment.model";

export const getInvoicePayments = async (invoiceId: number) => {
  try {
    const response = await axios.get<InvoicePaymentModel[]>(
      api + `invoice/${invoiceId}/payments`,
    );
    return response.data;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

export const recordPayment = async (
  invoiceId: number,
  payload: RecordPaymentPayload,
) => {
  try {
    const response = await axios.post<InvoicePaymentModel>(
      api + `invoice/${invoiceId}/payments`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

export const invalidatePayment = async (
  paymentId: number,
  payload: InvalidatePaymentPayload,
) => {
  try {
    const response = await axios.post<InvoicePaymentModel>(
      api + `invoice/payments/${paymentId}/invalidate`,
      payload,
      { headers: { "Content-Type": "application/json" } },
    );
    return response.data;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

export const invoicePaymentService = {
  getInvoicePayments,
  recordPayment,
  invalidatePayment,
};

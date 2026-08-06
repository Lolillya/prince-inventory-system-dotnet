import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";

export interface VoidInvoicePrecheckFailure {
  isPrecheckFailure: true;
  message: string;
  activePaymentCount: number;
  activePaymentTotal: number;
}

export const voidInvoice = async (
  invoiceId: number,
  password: string,
  reason: string,
) => {
  try {
    const response = await axios.patch(api + `invoice/${invoiceId}/void`, {
      password,
      reason,
    });
    return response.data;
  } catch (e) {
    // A 409 here specifically means the invoice still has active (not yet
    // invalidated) applied payments — surface that as a typed error so the
    // caller can show the "Unable to void this invoice" precheck modal
    // instead of a generic toast.
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      const data = e.response.data ?? {};
      const failure: VoidInvoicePrecheckFailure = {
        isPrecheckFailure: true,
        message: data.message ?? "This invoice has applied payments.",
        activePaymentCount: data.activePaymentCount ?? 0,
        activePaymentTotal: data.activePaymentTotal ?? 0,
      };
      throw failure;
    }

    // A 401 here means the confirmed password was wrong — let the caller's
    // password modal show an inline error instead of a generic toast.
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      throw e;
    }

    handleError(e);
    throw e;
  }
};

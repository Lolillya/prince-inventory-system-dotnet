import { handleError } from "@/helpers/error-handler.helper";
import { InvoiceProductModel } from "@/models/invoice.model";
import axios from "axios";
import { api } from "../api/API.service";

export const createInvoice = async (
  payload: InvoiceProductModel[],
  customerId?: string | number,
  userId?: string | number,
  invoiceTerm?: number
) => {
  console.log("customerId: ", customerId);
  console.log("userId: ", userId);

  try {
    const dtos = {
      LineItem: [{}],
      Invoice_Clerk: userId,
      Customer_ID: customerId,
      Term: invoiceTerm,
      Notes: "Sample Invoice Note",
    };

    dtos.LineItem = payload.map((p) => ({
      item: {
        brand: p.invoice.item.brand,
        product: p.invoice.item.product,
        variant: p.invoice.item.variant,
      },
      total: p.invoice.unit_price * p.invoice.unit_quantity,
      unit: p.invoice.unit,
      unit_price: p.invoice.unit_price,
      unit_quantity: p.invoice.unit_quantity,
    }));

    console.log("dto: ", dtos);

    const res = await axios.post(api + "invoice/", dtos, {
      headers: { "Content-Type": "application/json" },
    });

    return res.data;
  } catch (e) {
    handleError(e);
  }
};

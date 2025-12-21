import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";
import { InvoiceDTO } from "./models/invoice-dto.model";
import { InvoiceAddPayloadModel } from "./models/invoice-add-payload.model";

export const createInvoice = async (
  payload: InvoiceAddPayloadModel[],
  customerId?: string | number,
  userId?: string | number,
  invoiceTerm?: number
) => {
  console.log("payload: ", payload);
  console.log("customerId: ", customerId);
  console.log("userId: ", userId);
  console.log("invoiceTerm: ", invoiceTerm);

  try {
    const dtos: InvoiceDTO = {
      LineItem: [],
      Invoice_Clerk: userId,
      Customer_ID: customerId,
      Term: invoiceTerm,
      Notes: "Sample Invoice Note",
    };

    dtos.LineItem = payload.map((p) => ({
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
      product_ID: p.invoice.product.product_ID,
      unit: p.invoice.unit,
      uom_ID: p.invoice.uom_ID,
      unit_Price: p.invoice.unit_price,
      unit_quantity: p.invoice.unit_quantity,
      subtotal: p.invoice.total,
      discount: p.invoice.discount,
      isPercentageDiscount: p.invoice.isDiscountPercentage,
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

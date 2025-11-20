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
  console.log("customerId: ", customerId);
  console.log("userId: ", userId);

  try {
    const dtos: InvoiceDTO = {
      LineItem: [],
      Invoice_Clerk: userId,
      Customer_ID: customerId,
      Term: invoiceTerm,
      Notes: "Sample Invoice Note",
    };

    dtos.LineItem = payload.map((p) => ({
      item: {
        brand: {
          BrandName: p.invoice.item.product.brand.brandName,
          CreatedAt: p.invoice.item.product.brand.createdAt,
          UpdatedAt: p.invoice.item.product.brand.updatedAt,
        },
        product: {
          Product_ID: p.invoice.item.product.product_ID,
          ProductCode: p.invoice.item.product.productCode,
          ProductName: p.invoice.item.product.productName,
          Description: p.invoice.item.product.desc,
          Brand_Id: p.invoice.item.product.brand_id,
          Category_Id: p.invoice.item.product.category_id,
          CreatedAt: p.invoice.item.product.createdAt,
          UpcatedAt: p.invoice.item.product.updatedAt,
        },
        variant: {
          ProductId: p.invoice.item.product.variant.productId,
          VariantName: p.invoice.item.product.variant.variant_Name,
          CreatedAt: p.invoice.item.product.variant.createdAt,
          UpcatedAt: p.invoice.item.product.variant.updatedAt,
        },
      },
      total: p.invoice.total,
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

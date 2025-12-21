import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceAddProductModel } from "./models/invoice-add-product.model";
import { InvoiceAddPayloadModel } from "./models/invoice-add-payload.model";
import { InvoiceRestockBatchModel } from "./models/invoice-restock-batch.model";
import { useInvoicePayloadQuery } from "./invoice-create-payload";

const InvoiceProductKey = ["invoice-product"];

export const useSelectedProductInvoiceQuery = () => {
  return useQuery<InvoiceRestockBatchModel[]>({
    queryKey: InvoiceProductKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useSelectedInvoiceProduct = () => {
  const queryClient = useQueryClient();
  const { ADD_INVOICE_PAYLOAD, REMOVE_INVOICE_PAYLOAD } =
    useInvoicePayloadQuery();

  const ADD_PRODUCT = (data: InvoiceRestockBatchModel) => {
    queryClient.setQueryData<InvoiceRestockBatchModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const exists = old.some(
          (p) =>
            p.product.product_ID === data.product.product_ID &&
            p.product.variant.variant_Name === data.product.variant.variant_Name
        );
        const next = exists ? old : [...old, data];
        return next;
      }
    );

    const payload: InvoiceAddPayloadModel = {
      invoice: {
        product: data.product,
        unit: "",
        unit_quantity: 0,
        unit_price: 0,
        discount: 0,
        total: 0,
        isDiscountPercentage: false,
        invoice_Clerk: "",
        term: 0,
        uom_ID: 0,
      },
    };

    ADD_INVOICE_PAYLOAD(payload);
  };

  const REMOVE_PRODUCT = (product: InvoiceAddProductModel) => {
    // Remove from display state
    // TO BE UPDATED:
    queryClient.setQueryData<InvoiceAddProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const next = old.filter(
          (p) =>
            !(
              p.invoice.item.product.product_ID ===
                product.invoice.item.product.product_ID &&
              p.invoice.item.product.variant.variant_Name ===
                product.invoice.item.product.variant.variant_Name
            )
        );

        return next;
      }
    );

    // Also remove from payload
    REMOVE_INVOICE_PAYLOAD(
      product.invoice.item.product.product_ID,
      product.invoice.item.product.variant.variant_Name
    );
  };

  const CLEAR_TO_INVOICE_LIST = () => {
    queryClient.setQueryData<InvoiceAddProductModel[]>(InvoiceProductKey, []);
  };

  return {
    ADD_PRODUCT,
    REMOVE_PRODUCT,
    CLEAR_TO_INVOICE_LIST,
  };
};

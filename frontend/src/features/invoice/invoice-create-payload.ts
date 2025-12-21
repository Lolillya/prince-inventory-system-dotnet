import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceAddPayloadModel } from "./models/invoice-add-payload.model";

const InvoicePayloadKey = ["invoice-payload"];

export const useSelectedPayloadInvoiceQuery = () => {
  return useQuery<InvoiceAddPayloadModel[]>({
    queryKey: InvoicePayloadKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useInvoicePayloadQuery = () => {
  const queryClient = useQueryClient();

  const ADD_INVOICE_PAYLOAD = (data: InvoiceAddPayloadModel) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        // Check if product with same ID and variant already exists
        const exists = old.some(
          (item) =>
            item.invoice.product.product_ID ===
              data.invoice.product.product_ID &&
            item.invoice.product.variant.variant_Name ===
              data.invoice.product.variant.variant_Name
        );
        // Only add if it doesn't exist
        const next = exists ? old : [...old, data];
        return next;
      }
    );
  };

  const UPDATE_INVOICE_PAYLOAD_UNIT = (
    productId: number,
    variantName: string,
    unit: string
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          if (
            item.invoice.product.product_ID === productId &&
            item.invoice.product.variant.variant_Name === variantName
          ) {
            return {
              ...item,
              invoice: {
                ...item.invoice,
                unit: unit,
              },
            };
          }
          return item;
        });
      }
    );
  };

  const UPDATE_INVOICE_PAYLOAD_PRICE = (
    productId: number,
    variantName: string,
    price: number
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          if (
            item.invoice.product.product_ID === productId &&
            item.invoice.product.variant.variant_Name === variantName
          ) {
            return {
              ...item,
              invoice: {
                ...item.invoice,
                unit_price: price,
              },
            };
          }
          return item;
        });
      }
    );
  };

  const UPDATE_INVOICE_PAYLOAD_QUANTITY = (
    productId: number,
    variantName: string,
    quantity: number
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          if (
            item.invoice.product.product_ID === productId &&
            item.invoice.product.variant.variant_Name === variantName
          ) {
            return {
              ...item,
              invoice: {
                ...item.invoice,
                unit_quantity: quantity,
              },
            };
          }
          return item;
        });
      }
    );
  };

  const UPDATE_INVOICE_PAYLOAD_DISCOUNT = (
    productId: number,
    variantName: string,
    discount: number
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          if (
            item.invoice.product.product_ID === productId &&
            item.invoice.product.variant.variant_Name === variantName
          ) {
            return {
              ...item,
              invoice: {
                ...item.invoice,
                discount: discount,
              },
            };
          }
          return item;
        });
      }
    );
  };

  const UPDATE_INVOICE_PAYLOAD_TOTAL = (
    productId: number,
    variantName: string,
    total: number
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          if (
            item.invoice.product.product_ID === productId &&
            item.invoice.product.variant.variant_Name === variantName
          ) {
            return {
              ...item,
              invoice: {
                ...item.invoice,
                total: total,
              },
            };
          }
          return item;
        });
      }
    );
  };

  const REMOVE_INVOICE_PAYLOAD = (productId: number, variantName: string) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.filter(
          (item) =>
            !(
              item.invoice.product.product_ID === productId &&
              item.invoice.product.variant.variant_Name === variantName
            )
        );
      }
    );
  };

  return {
    ADD_INVOICE_PAYLOAD,
    UPDATE_INVOICE_PAYLOAD_UNIT,
    UPDATE_INVOICE_PAYLOAD_PRICE,
    UPDATE_INVOICE_PAYLOAD_QUANTITY,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT,
    UPDATE_INVOICE_PAYLOAD_TOTAL,
    REMOVE_INVOICE_PAYLOAD,
  };
};

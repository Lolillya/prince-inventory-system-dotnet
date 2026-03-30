import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceAddPayloadModel } from "./models/invoice-add-payload.model";
import { useInvoicePayloadQuery } from "./invoice-create-payload";
import { InventoryProductModel } from "../inventory/models/inventory.model";

const InvoiceProductKey = ["invoice-product"];

export const useSelectedProductInvoiceQuery = () => {
  return useQuery<InventoryProductModel[]>({
    queryKey: InvoiceProductKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useSelectedInvoiceProduct = () => {
  const queryClient = useQueryClient();
  const { ADD_INVOICE_PAYLOAD, REMOVE_INVOICE_PAYLOAD, CLEAR_INVOICE_PAYLOAD } =
    useInvoicePayloadQuery();

  const ADD_PRODUCT = (data: InventoryProductModel) => {
    queryClient.setQueryData<InventoryProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const exists = old.some(
          (p) =>
            p.product.product_ID === data.product.product_ID &&
            p.variant.variant_Name === data.variant.variant_Name,
        );
        const next = exists ? old : [...old, data];
        return next;
      },
    );

    const payload: InvoiceAddPayloadModel = {
      invoice: {
        product: data.product,
        brand: data.brand,
        variant: data.variant,
        category: data.category,
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

  const REMOVE_PRODUCT = (product: InventoryProductModel) => {
    queryClient.setQueryData<InventoryProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const next = old.filter(
          (p) =>
            !(
              p.product.product_ID === product.product.product_ID &&
              p.variant.variant_Name === product.variant.variant_Name
            ),
        );

        return next;
      },
    );

    REMOVE_INVOICE_PAYLOAD(
      product.product.product_ID,
      product.variant.variant_Name,
    );
  };

  const CLEAR_TO_INVOICE_LIST = () => {
    queryClient.setQueryData<InventoryProductModel[]>(InvoiceProductKey, []);
    CLEAR_INVOICE_PAYLOAD();
  };

  return {
    ADD_PRODUCT,
    REMOVE_PRODUCT,
    CLEAR_TO_INVOICE_LIST,
  };
};

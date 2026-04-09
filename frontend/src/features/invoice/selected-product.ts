import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceAddPayloadModel } from "./models/invoice-add-payload.model";
import { useInvoicePayloadQuery } from "./invoice-create-payload";
import { InventoryProductModel } from "../inventory/models/inventory.model";

const InvoiceProductKey = ["invoice-product"];

export type SelectedInvoiceItem = {
  itemKey: string;
  data: InventoryProductModel;
};

export const useSelectedProductInvoiceQuery = () => {
  return useQuery<SelectedInvoiceItem[]>({
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
    const current =
      queryClient.getQueryData<SelectedInvoiceItem[]>(InvoiceProductKey) ?? [];

    // Guard: cannot add more cards than there are available presets for this product+variant.
    const existingCount = current.filter(
      (item) =>
        item.data.product.product_ID === data.product.product_ID &&
        item.data.variant.variant_Name === data.variant.variant_Name,
    ).length;

    if (existingCount >= (data.unitPresets?.length ?? 0)) return;

    const itemKey = crypto.randomUUID();

    queryClient.setQueryData<SelectedInvoiceItem[]>(
      InvoiceProductKey,
      (old = []) => [...old, { itemKey, data }],
    );

    const payload: InvoiceAddPayloadModel = {
      invoice: {
        itemKey,
        product: data.product,
        brand: data.brand,
        variant: data.variant,
        category: data.category,
        unit: "",
        preset_ID: null,
        supplement_Preset_IDs: [],
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

  const REMOVE_PRODUCT = (itemKey: string) => {
    queryClient.setQueryData<SelectedInvoiceItem[]>(
      InvoiceProductKey,
      (old = []) => old.filter((p) => p.itemKey !== itemKey),
    );

    REMOVE_INVOICE_PAYLOAD(itemKey);
  };

  const CLEAR_TO_INVOICE_LIST = () => {
    queryClient.setQueryData<SelectedInvoiceItem[]>(InvoiceProductKey, []);
    CLEAR_INVOICE_PAYLOAD();
  };

  return {
    ADD_PRODUCT,
    REMOVE_PRODUCT,
    CLEAR_TO_INVOICE_LIST,
  };
};

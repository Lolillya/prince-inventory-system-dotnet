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
        const exists = old.some(
          (item) => item.invoice.itemKey === data.invoice.itemKey,
        );
        return exists ? old : [...old, data];
      },
    );
  };

  const UPDATE_INVOICE_PAYLOAD_UNIT = (
    itemKey: string,
    unit: string,
    uom_ID: number,
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, unit, uom_ID } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_PRESET = (
    itemKey: string,
    preset_ID: number | null,
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, preset_ID } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS = (
    itemKey: string,
    supplement_Preset_IDs: number[],
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, supplement_Preset_IDs } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE = (isPercentage: boolean) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          return {
            ...item,
            invoice: {
              ...item.invoice,
              isDiscountPercentage: isPercentage,
            },
          };
        });
      },
    );
  };

  const UPDATE_INVOICE_PAYLOAD_PRICE = (itemKey: string, price: number) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, unit_price: price } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_QUANTITY = (
    itemKey: string,
    quantity: number,
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, unit_quantity: quantity } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_DISCOUNT = (
    itemKey: string,
    discount: number,
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, discount } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_TOTAL = (itemKey: string, total: number) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, total } }
            : item,
        ),
    );
  };

  const UPDATE_INVOICE_CLERK = (id: string) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          return {
            ...item,
            invoice: {
              ...item.invoice,
              invoice_Clerk: id,
            },
          };
        });
      },
    );
  };

  const UPDATE_INVOICE_TERM = (term: number) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        return old.map((item) => {
          return {
            ...item,
            invoice: {
              ...item.invoice,
              term: term,
            },
          };
        });
      },
    );
  };

  const REMOVE_INVOICE_PAYLOAD = (itemKey: string) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => old.filter((item) => item.invoice.itemKey !== itemKey),
    );
  };

  const UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH = (
    itemKey: string,
    auto_Replenish: boolean,
  ) => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) =>
        old.map((item) =>
          item.invoice.itemKey === itemKey
            ? { ...item, invoice: { ...item.invoice, auto_Replenish } }
            : item,
        ),
    );
  };

  const CLEAR_INVOICE_PAYLOAD = () => {
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(InvoicePayloadKey, []);
  };

  return {
    ADD_INVOICE_PAYLOAD,
    UPDATE_INVOICE_PAYLOAD_PRESET,
    UPDATE_INVOICE_PAYLOAD_SUPPLEMENT_PRESETS,
    UPDATE_INVOICE_PAYLOAD_UNIT,
    UPDATE_INVOICE_PAYLOAD_PRICE,
    UPDATE_INVOICE_PAYLOAD_QUANTITY,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT,
    UPDATE_INVOICE_PAYLOAD_TOTAL,
    UPDATE_INVOICE_PAYLOAD_DISCOUNT_TYPE,
    UPDATE_INVOICE_PAYLOAD_AUTO_REPLENISH,
    UPDATE_INVOICE_TERM,
    UPDATE_INVOICE_CLERK,
    REMOVE_INVOICE_PAYLOAD,
    CLEAR_INVOICE_PAYLOAD,
  };
};

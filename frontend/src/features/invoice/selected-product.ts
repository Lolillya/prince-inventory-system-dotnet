import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InvoiceAddProductModel } from "./models/invoice-add-product.model";
import { InvoiceAddPayloadModel } from "./models/invoice-add-payload.model";

const InvoiceProductKey = ["invoice-product"];
const InvoicePayloadKey = ["invoice-payload"];

export const useSelectedProductInvoiceQuery = () => {
  return useQuery<InvoiceAddProductModel[]>({
    queryKey: InvoiceProductKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useSelectedPayloadInvoiceQuery = () => {
  return useQuery<InvoiceAddPayloadModel[]>({
    queryKey: InvoicePayloadKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useSelectedInvoiceProduct = () => {
  const queryClient = useQueryClient();

  const addProduct = (product: InvoiceAddProductModel) => {
    // Add to display state with units array
    queryClient.setQueryData<InvoiceAddProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const exists = old.some(
          (p) =>
            p.invoice.item.product.product_ID ===
              product.invoice.item.product.product_ID &&
            p.invoice.item.product.variant.variant_Name ===
              product.invoice.item.product.variant.variant_Name
        );
        const next = exists ? old : [...old, product];
        return next;
      }
    );

    // Add to payload state with default unit string (first unit)
    const defaultUnit = product.invoice.unit[0]?.uoM_Name || "";
    const payloadProduct: InvoiceAddPayloadModel = {
      invoice: {
        item: product.invoice.item,
        unit: defaultUnit,
        unit_quantity: product.invoice.unit_quantity,
        unit_price: product.invoice.unit_price,
        discount: product.invoice.discount,
        total: product.invoice.total,
      },
    };

    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        const exists = old.some(
          (p) =>
            p.invoice.item.product.product_ID ===
              payloadProduct.invoice.item.product.product_ID &&
            p.invoice.item.product.variant.variant_Name ===
              payloadProduct.invoice.item.product.variant.variant_Name
        );
        const next = exists ? old : [...old, payloadProduct];
        return next;
      }
    );
  };

  // Update quantity by product id and optional variant name (matches UI usage)
  const updateInvoiceQuantityByKey = (
    productId: string | number,
    unit_quantity: number,
    variant_Name?: string
  ) => {
    queryClient.setQueryData<InvoiceAddProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const idx = old.findIndex(
          (p) =>
            String(p.invoice.item.product.product_ID) === String(productId) &&
            (variant_Name
              ? p.invoice.item.product.variant.variant_Name === variant_Name
              : true)
        );
        if (idx === -1) return old;

        const target = old[idx];
        const updatedItem: InvoiceAddProductModel = {
          ...target,
          invoice: {
            ...target.invoice,
            unit_quantity,
          },
        };
        const newArr = [...old];
        newArr[idx] = updatedItem;
        return newArr;
      }
    );
  };

  // Update unit price by product id and optional variant name
  const UPDATE_INVOICE_UNIT_PRICE = (
    productId: string | number,
    unit_price: number,
    variant_Name?: string
  ) => {
    queryClient.setQueryData<InvoiceAddProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const idx = old.findIndex(
          (p) =>
            String(p.invoice.item.product.product_ID) === String(productId) &&
            (variant_Name
              ? p.invoice.item.product.variant.variant_Name === variant_Name
              : true)
        );
        if (idx === -1) return old;

        const target = old[idx];
        const updatedItem: InvoiceAddProductModel = {
          ...target,
          invoice: {
            ...target.invoice,
            unit_price,
          },
        };
        const newArr = [...old];
        newArr[idx] = updatedItem;
        return newArr;
      }
    );
  };

  const UPDATE_INVOICE_UNIT = (
    productId: string | number,
    unit: string,
    variant_Name: string
  ) => {
    // Update payload state with selected unit string
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
      (old = []) => {
        const idx = old.findIndex(
          (p) =>
            String(p.invoice.item.product.product_ID) === String(productId) &&
            (variant_Name
              ? p.invoice.item.product.variant.variant_Name === variant_Name
              : true)
        );
        if (idx === -1) return old;

        const target = old[idx];
        const updatedItem: InvoiceAddPayloadModel = {
          ...target,
          invoice: {
            ...target.invoice,
            unit,
          },
        };
        const newArr = [...old];
        newArr[idx] = updatedItem;
        return newArr;
      }
    );
  };

  // Update discount by product id and optional variant name
  const updateInvoiceDiscountByKey = (
    productId: string | number,
    discount: number,
    variant_Name?: string
  ) => {
    queryClient.setQueryData<InvoiceAddProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        const idx = old.findIndex(
          (p) =>
            String(p.invoice.item.product.product_ID) === String(productId) &&
            (variant_Name
              ? p.invoice.item.product.variant.variant_Name === variant_Name
              : true)
        );
        if (idx === -1) return old;

        const target = old[idx];
        const updatedItem: InvoiceAddProductModel = {
          ...target,
          invoice: {
            ...target.invoice,
            discount,
          },
        };
        const newArr = [...old];
        newArr[idx] = updatedItem;
        return newArr;
      }
    );
  };

  const removeProduct = (product: InvoiceAddProductModel) => {
    // Remove from display state
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

    // Remove from payload state
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(
      InvoicePayloadKey,
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
  };

  const clearList = () => {
    queryClient.setQueryData<InvoiceAddProductModel[]>(InvoiceProductKey, []);
    queryClient.setQueryData<InvoiceAddPayloadModel[]>(InvoicePayloadKey, []);
  };

  return {
    addProduct,
    removeProduct,
    updateInvoiceQuantityByKey,
    UPDATE_INVOICE_UNIT_PRICE,
    UPDATE_INVOICE_UNIT,
    updateInvoiceDiscountByKey,
    clearList,
  };
};

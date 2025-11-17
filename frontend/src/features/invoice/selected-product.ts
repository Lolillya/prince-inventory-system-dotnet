import { InvoiceProductModel } from "@/models/invoice.model";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const InvoiceProductKey = ["invoice-product"];

export const useSelectedProductInvoiceQuery = () => {
  return useQuery<InvoiceProductModel[]>({
    queryKey: InvoiceProductKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useSelectedInvoiceProduct = () => {
  const queryClient = useQueryClient();

  const addProduct = (product: InvoiceProductModel) => {
    queryClient.setQueryData<InvoiceProductModel[]>(
      InvoiceProductKey,
      (old = []) => {
        // Check if product already exists
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
  };

  // Update quantity by product id and optional variant name (matches UI usage)
  const updateInvoiceQuantityByKey = (
    productId: string | number,
    unit_quantity: number,
    variant_Name?: string
  ) => {
    queryClient.setQueryData<InvoiceProductModel[]>(
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
        const updatedItem: InvoiceProductModel = {
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
    queryClient.setQueryData<InvoiceProductModel[]>(
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
        const updatedItem: InvoiceProductModel = {
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
    queryClient.setQueryData<InvoiceProductModel[]>(
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
        const updatedItem: InvoiceProductModel = {
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
    queryClient.setQueryData<InvoiceProductModel[]>(
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
        const updatedItem: InvoiceProductModel = {
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

  const removeProduct = (product: InvoiceProductModel) => {
    queryClient.setQueryData<InvoiceProductModel[]>(
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
  };

  const clearList = () => {
    queryClient.setQueryData<InvoiceProductModel[]>(InvoiceProductKey, []);
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

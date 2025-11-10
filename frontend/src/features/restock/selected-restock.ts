import { RestockModel } from "@/models/restock.model";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const RestockProductKey = ["restock-product"];

export const useSelectedRestockProduct = () => {
  return useQuery<RestockModel[]>({
    queryKey: RestockProductKey,
    queryFn: async () => {
      return [];
    },
    enabled: false,
  });
};

export const useSelectedRestock = () => {
  const queryClient = useQueryClient();

  const addProduct = (product: RestockModel) => {
    queryClient.setQueryData<RestockModel[]>(RestockProductKey, (old = []) => {
      // Check if product already exists
      const exists = old.some(
        (p) =>
          p.restock.items.product.product_ID ===
            product.restock.items.product.product_ID &&
          p.restock.items.variant.variantName ===
            product.restock.items.variant.variantName
      );
      const next = exists ? old : [...old, product];
      // Log the updated selected invoices

      return next;
    });
  };

  const UPDATE_RESTOCK_UNIT_PRICE = (
    productId: string | number,
    unit_price: number,
    variantName?: string
  ) => {
    queryClient.setQueryData<RestockModel[]>(RestockProductKey, (old = []) => {
      const idx = old.findIndex(
        (p) =>
          String(p.restock.items.product.product_ID) === String(productId) &&
          (variantName
            ? p.restock.items.variant.variantName === variantName
            : true)
      );
      if (idx === -1) return old;

      const target = old[idx];
      const updatedItem: RestockModel = {
        ...target,
        restock: {
          ...target.restock,
          unit_price,
        },
      };
      const newArr = [...old];
      newArr[idx] = updatedItem;

      return newArr;
    });
  };

  const UPDATE_RESTOCK_QUANTITY = (
    productId: string | number,
    unit_quantity: number,
    variantName?: string
  ) => {
    queryClient.setQueryData<RestockModel[]>(RestockProductKey, (old = []) => {
      const idx = old.findIndex(
        (p) =>
          String(p.restock.items.product.product_ID) === String(productId) &&
          (variantName
            ? p.restock.items.variant.variantName === variantName
            : true)
      );
      if (idx === -1) return old;

      const target = old[idx];
      const updatedItem: RestockModel = {
        ...target,
        restock: {
          ...target.restock,
          unit_quantity,
        },
      };
      const newArr = [...old];
      newArr[idx] = updatedItem;
      return newArr;
    });
  };

  const UPDATE_RESTOCK_UNIT = (
    productId: string | number,
    unit: string,
    variantName?: string
  ) => {
    queryClient.setQueryData<RestockModel[]>(RestockProductKey, (old = []) => {
      const idx = old.findIndex(
        (p) =>
          String(p.restock.items.product.product_ID) === String(productId) &&
          (variantName
            ? p.restock.items.variant.variantName === variantName
            : true)
      );
      if (idx === -1) return old;

      const target = old[idx];
      const updatedItem: RestockModel = {
        ...target,
        restock: {
          ...target.restock,
          unit,
        },
      };
      const newArr = [...old];
      newArr[idx] = updatedItem;
      return newArr;
    });
  };

  const removeProduct = (product: RestockModel) => {
    queryClient.setQueryData<RestockModel[]>(RestockProductKey, (old = []) => {
      const next = old.filter(
        (p) =>
          !(
            p.restock.items.product.product_ID ===
              product.restock.items.product.product_ID &&
            p.restock.items.variant.variantName ===
              product.restock.items.variant.variantName
          )
      );

      return next;
    });
  };

  return {
    addProduct,
    removeProduct,
    UPDATE_RESTOCK_QUANTITY,
    UPDATE_RESTOCK_UNIT_PRICE,
    UPDATE_RESTOCK_UNIT,
  };
};

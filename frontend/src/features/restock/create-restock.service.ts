import { handleError } from "@/helpers/error-handler.helper";
import { api } from "../api/API.service";
import { useSelectedRestockSupplier } from "./selected-supplier";
import { useAuth } from "@/context/use-auth";

import axios from "axios";
import { NewRestockModel } from "./models/restock-add-new";

// Pure function that does not use hooks. Accepts supplierId and userId as arguments.
export const createRestock = async (
  payload: NewRestockModel[],
  supplierId?: string | number,
  userId?: string | number
) => {
  // console.log("payload: ", payload);
  console.log("supplierId: ", supplierId, "userId:", userId);
  try {
    const dtos = {
      LineItem: [{}],
      Batch: {
        Batch_Number: 0,
        Supplier_ID: supplierId,
      },
      Restock_Clerk: userId,
      Notes: "Sample Restock Note",
    };

    dtos.LineItem = payload.map((p) => ({
      item: {
        brand: {
          BrandName: p.restock.items.brand.brand_Name,
          CreatedAt: p.restock.items.brand.created_At,
          UpdatedAt: p.restock.items.brand.updated_At,
        },
        product: {
          Product_ID: p.restock.items.product.product_ID,
          ProductCode: p.restock.items.product.product_Code,
          ProductName: p.restock.items.product.product_Name,
          Description: p.restock.items.product.desc,
          Brand_Id: p.restock.items.product.brand_ID,
          Category_Id: p.restock.items.product.category_ID,
          CreatedAt: p.restock.items.product.created_At,
          UpdatedAt: p.restock.items.product.updated_At,
        },
        variant: {
          ProductId: p.restock.items.product.product_ID,
          VariantName: p.restock.items.variant.variant_Name,
          CreatedAt: p.restock.items.variant.created_At,
          UpdatedAt: p.restock.items.variant.updated_At,
        },
      },
      total: p.restock.total ?? p.restock.unit_price * p.restock.unit_quantity,
      uom_ID: p.restock.uom_ID,
      unit_price: p.restock.unit_price,
      unit_quantity: p.restock.unit_quantity,
      unitConversions:
        p.restock.unitConversions?.map((conv) => ({
          fromUnit: conv.fromUnit,
          toUnit: conv.toUnit,
          conversionFactor: conv.conversionFactor,
          quantity: conv.quantity,
          price: conv.price,
        })) || [],
    }));

    console.log("dto: ", dtos);

    const res = await axios.post(api + "restock/", dtos, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("create restock response:", res.data);
    return res.data;
  } catch (e) {
    handleError(e);
  }
};

// Hook wrapper that binds hooks and returns a safe caller for components
export const useCreateRestock = () => {
  const { data: supplier } = useSelectedRestockSupplier();
  const { user } = useAuth();

  const call = async (payload: NewRestockModel[]) => {
    return createRestock(payload, supplier?.id, user?.user_ID);
  };

  return { createRestock: call };
};

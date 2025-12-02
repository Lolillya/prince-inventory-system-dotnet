import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddProductPayload } from "./models/AddProductPayload.model";

const ADD_PRODUCT_PAYLOAD_QUERY_KEY = ["add-product-payload"];

export const AddProductPayloadQuery = () => {
  return useQuery<AddProductPayload>({
    queryKey: ADD_PRODUCT_PAYLOAD_QUERY_KEY,
    queryFn: async () => {
      return {
        productName: "",
        description: "",
        productCode: "",
        brand_ID: 0,
        category_Id: 0,
        variant_Id: 0,
        inventory_Clerk: "",
      };
    },
    enabled: false,
  });
};

export const updateAddProductPayload = () => {
  const queryClient = useQueryClient();

  const UPDATE_ADD_PRODUCT_PAYLOAD = (payload: AddProductPayload) => {
    queryClient.setQueryData(ADD_PRODUCT_PAYLOAD_QUERY_KEY, payload);
  };

  return {
    UPDATE_ADD_PRODUCT_PAYLOAD,
  };
};

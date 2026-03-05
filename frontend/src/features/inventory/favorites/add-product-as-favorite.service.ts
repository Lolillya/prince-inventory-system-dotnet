import axios from "axios";
import { handleError } from "@/helpers/error-handler.helper";
import { api } from "@/features/api/API.service";

export const AddProductAsFavoriteService = async (product_ID: number) => {
  try {
    const response = await axios.post(`${api}user-favorites`, {
      Product_ID: product_ID,
    });
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const RemoveProductFromFavoritesService = async (product_ID: number) => {
  try {
    const response = await axios.delete(
      `${api}user-favorites/by-product/${product_ID}`,
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

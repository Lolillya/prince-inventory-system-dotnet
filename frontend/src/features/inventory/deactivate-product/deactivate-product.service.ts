import axios from "axios";
import { handleError } from "../../../helpers/error-handler.helper";
import { api } from "../../api/API.service";

export const deactivateProductService = async (
  productId: number,
  password: string,
) => {
  try {
    const { data } = await axios.patch(
      `${api}inventory/${productId}/deactivate`,
      { password },
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

import axios from "axios";
import { handleError } from "../../../helpers/error-handler.helper";
import { api } from "../../api/API.service";

export const reactivateProductService = async (
  productId: number,
  password: string,
) => {
  try {
    const { data } = await axios.patch(
      `${api}inventory/${productId}/reactivate`,
      { password },
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

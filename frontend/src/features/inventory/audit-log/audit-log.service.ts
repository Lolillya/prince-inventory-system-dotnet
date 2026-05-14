import axios from "axios";
import { handleError } from "../../../helpers/error-handler.helper";
import { api } from "../../api/API.service";
import { ProductAuditLog } from "./audit-log.model";

export const getProductAuditLogs = async (
  productId: number,
  presetId?: number,
): Promise<ProductAuditLog[]> => {
  try {
    const params = presetId !== undefined ? { presetId } : {};
    const { data } = await axios.get<ProductAuditLog[]>(
      `${api}product-audit-logs/${productId}`,
      { params },
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

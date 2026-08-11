import axios from "axios";
import { handleError } from "@/helpers/error-handler.helper";
import { api } from "@/features/api/API.service";
import { UserAuditLog } from "./user-audit-log.model";

export const getUserAuditLogs = async (
  userId: string,
): Promise<UserAuditLog[]> => {
  try {
    const { data } = await axios.get<UserAuditLog[]>(
      `${api}user-audit-logs/${userId}`,
    );
    return data;
  } catch (err) {
    handleError(err);
    throw err;
  }
};

import { useQuery } from "@tanstack/react-query";
import { getUserAuditLogs } from "./user-audit-log.service";
import { UserAuditLog } from "./user-audit-log.model";

export const useUserAuditLogQuery = (userId?: string) => {
  return useQuery<UserAuditLog[]>({
    queryKey: ["user-audit-logs", userId],
    queryFn: () => getUserAuditLogs(userId!),
    enabled: !!userId,
  });
};

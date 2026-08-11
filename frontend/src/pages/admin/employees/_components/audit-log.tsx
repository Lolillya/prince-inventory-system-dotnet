import { useUserAuditLogQuery } from "@/features/employees/user-audit-log/user-audit-log.query";

interface AuditLogProps {
  userId?: string;
}

export const AuditLog = ({ userId }: AuditLogProps) => {
  const { data: logs, isLoading } = useUserAuditLogQuery(userId);

  return (
    <div className="flex flex-col gap-3 mt-3">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="text-left px-4 py-2 font-medium">Date & Time</th>
              <th className="text-left px-4 py-2 font-medium">Admin User</th>
              <th className="text-left px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-4 py-3 text-gray-400" colSpan={3}>
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && (!logs || logs.length === 0) && (
              <tr>
                <td className="px-4 py-3 text-gray-400" colSpan={3}>
                  No activity recorded yet.
                </td>
              </tr>
            )}
            {logs?.map((log) => (
              <tr
                key={log.auditLog_ID}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(log.createdAt))}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full bg-purple-500 w-6 h-6 flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-white font-semibold">
                        {log.adminUsername.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700">
                      {log.adminUsername.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-700">
                  {log.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

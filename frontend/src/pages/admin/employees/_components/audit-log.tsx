import { useUserAuditLogQuery } from "@/features/employees/user-audit-log/user-audit-log.query";
import { UserAuditLog } from "@/features/employees/user-audit-log/user-audit-log.model";
import { ChevronsUpDown, Download, FileText } from "lucide-react";

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

interface AuthenticationAuditLogProps {
  logs: UserAuditLog[];
  isLoading: boolean;
  isError: boolean;
  formatDate: (value: string) => string;
  onClose: () => void;
}

export const AuthenticationAuditLog = ({ logs, isLoading, isError, formatDate, onClose }: AuthenticationAuditLogProps) => (
  <div className="flex flex-col">
    <div className="min-h-[420px] px-5 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-indigo-100">
            <FileText size={23} strokeWidth={1.8} className="text-indigo-500" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-700">Audit Log</h4>
            <p className="mt-1 text-sm text-slate-500">A record of all password related changes.</p>
          </div>
        </div>
        <button
          type="button"
          className="h-11 w-auto max-w-none rounded-md border border-emerald-500 bg-white px-4 text-sm font-semibold text-emerald-600 shadow-sm hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:bg-emerald-100 active:shadow-none"
        >
          <Download size={18} aria-hidden="true" />
          Export Log
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[620px] table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-slate-50/70 text-slate-700">
              <th scope="col" className="w-[35%] px-5 py-4 text-left font-semibold">
                <div className="flex items-center gap-1">Date &amp; Time <ChevronsUpDown size={13} aria-hidden="true" /></div>
              </th>
              <th scope="col" className="w-[31%] px-5 py-4 text-left font-semibold">Admin User</th>
              <th scope="col" className="px-5 py-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-500" role="status">Loading audit log...</td></tr>
            ) : isError ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-red-600" role="alert">Unable to load audit log. Please try again later.</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-500">No activity recorded yet.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.auditLog_ID} className="border-b border-gray-200 last:border-b-0 hover:bg-slate-50/50">
                <td className="px-5 py-4 text-slate-500">{formatDate(log.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${avatarColor(log.adminUsername)}`} aria-hidden="true">
                      <span className="text-xs font-medium text-white">{log.adminUsername.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="break-all text-slate-700">{log.adminUsername.toUpperCase() || "—"}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block rounded px-3 py-1 text-xs font-medium ${actionColor(log.action)}`} title={log.description}>
                    {actionLabel(log.action, log.description)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="flex justify-end border-t border-gray-200 px-5 py-6 sm:px-8 sm:py-7">
      <button
        type="button"
        onClick={onClose}
        className="h-12 w-auto max-w-none rounded-md border border-gray-200 bg-white px-8 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      >
        Close
      </button>
    </div>
  </div>
);

const actionLabel = (action: string, description: string) => {
  switch (action) {
    case "PASSWORD_CHANGED": return "Password Changed";
    case "PASSWORD_RESET": return "Password Reset";
    case "USERNAME_CHANGED": return "Username Changed";
    default: return description || action || "—";
  }
};

const actionColor = (action: string) => {
  switch (action) {
    case "PASSWORD_CHANGED": return "bg-emerald-50 text-emerald-600";
    case "PASSWORD_RESET": return "bg-amber-50 text-amber-700";
    default: return "bg-slate-100 text-slate-600";
  }
};

const avatarColor = (username: string) => {
  const hash = Array.from(username).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return hash % 2 === 0 ? "bg-pink-500" : "bg-indigo-400";
};

export const AuditLog = () => {
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
            <tr className="border-b last:border-b-0 hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                Apr 25, 2026, 10:22 AM
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <div className="rounded-full bg-purple-500 w-6 h-6 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white font-semibold">
                      A1
                    </span>
                  </div>
                  <span className="text-gray-700">ADMIN1</span>
                </div>
              </td>
              <td className="px-4 py-2 text-gray-700">Password changed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

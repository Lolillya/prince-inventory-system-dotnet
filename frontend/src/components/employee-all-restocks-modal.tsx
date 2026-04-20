import { useState } from "react";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import { ShowAllModal } from "@/pages/admin/restock/_components/all-items-modal";
import { XIcon } from "@/icons";
import { Box, Calendar, Package, Search } from "lucide-react";
import { Separator } from "./separator";

interface Props {
  restocks: RestockAllModel[];
  onClose: () => void;
}

const restockStatusTag = (status: string | null) => {
  if (!status) return null;
  const map: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    VOIDED: "bg-red-100 text-red-600",
  };
  const classes = map[status.toUpperCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${classes}`}
    >
      {status}
    </span>
  );
};

export const EmployeeAllRestocksModal = ({ restocks, onClose }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedRestock, setSelectedRestock] =
    useState<RestockAllModel | null>(null);

  const filtered = restocks.filter((r) => {
    const term = search.toLowerCase();
    const byNumber = r.restock_Number.toLowerCase().includes(term);
    const bySupplier = (r.supplier?.companyName ?? "")
      .toLowerCase()
      .includes(term);
    return byNumber || bySupplier;
  });

  return (
    <>
      <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
        <div className="w-[520px] max-h-[620px] bg-white px-8 py-6 rounded-lg border shadow-lg relative flex flex-col gap-4">
          <div
            className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={onClose}
          >
            <XIcon />
          </div>

          <div>
            <h1 className="text-xl font-bold">Restocks</h1>
            <p className="text-sm text-gray-500 mt-1">
              {restocks.length} record/s
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-wash-gray border border-transparent focus-within:border-gray-300">
            <Search size={14} className="text-vesper-gray shrink-0" />
            <input
              type="text"
              placeholder="Search by restock # or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <Separator />

          <div className="overflow-y-auto flex flex-col gap-3 flex-1">
            {filtered.length === 0 && (
              <p className="text-sm text-center font-semibold text-gray-400 py-8">
                No restock found
              </p>
            )}
            {filtered.map((restock) => (
              <div
                key={restock.restock_Id}
                className="flex flex-col gap-2 p-3 rounded-lg bg-wash-gray hover:shadow-sm cursor-pointer transition-shadow"
                onClick={() => setSelectedRestock(restock)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-vesper-gray" />
                    <span className="text-sm font-semibold text-saltbox-gray">
                      {restock.restock_Number}
                    </span>
                  </div>
                  {restockStatusTag(restock.status)}
                </div>
                {restock.supplier && (
                  <p className="text-xs text-vesper-gray">
                    {restock.supplier.companyName ||
                      `${restock.supplier.firstName} ${restock.supplier.lastName}`}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-vesper-gray">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(restock.created_At))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Box size={12} />
                    <span>{restock.line_Items.length} item/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedRestock && (
        <ShowAllModal
          selectedRestock={selectedRestock}
          onClose={() => setSelectedRestock(null)}
        />
      )}
    </>
  );
};

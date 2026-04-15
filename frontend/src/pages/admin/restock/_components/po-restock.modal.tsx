import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XIcon, SearchIcon } from "@/icons";
import { useGetAllPurchaseOrdersQuery } from "@/features/purchase-order/purchase-order.query";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";

const STATUS_LABELS: Record<string, string> = {
  NOT_DELIVERED: "Not Delivered",
  PARTIAL: "Partial",
  FULLY_DELIVERED: "Fully Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  NOT_DELIVERED: "bg-blue-100 text-blue-700 border-blue-200",
  PARTIAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  FULLY_DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

interface PORestockModalProps {
  onClose: () => void;
}

export const PO_RestockModal = ({ onClose }: PORestockModalProps) => {
  const navigate = useNavigate();
  const { data: purchaseOrders = [], isLoading } =
    useGetAllPurchaseOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([
    "NOT_DELIVERED",
    "PARTIAL",
  ]);

  const toggleFilter = (status: string) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const filtered = purchaseOrders.filter((po) => {
    if (!activeFilters.includes(po.status)) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      po.purchase_Order_Number.toLowerCase().includes(term) ||
      (po.supplier.company_Name ?? "").toLowerCase().includes(term) ||
      (po.supplier.first_Name ?? "").toLowerCase().includes(term) ||
      (po.supplier.last_Name ?? "").toLowerCase().includes(term)
    );
  });

  const handleSelectPO = (po: PurchaseOrderRecord) => {
    onClose();
    navigate(`/admin/restock/po-restock/${po.purchase_Order_ID}`);
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[700px] max-h-[80vh] bg-white px-8 py-6 rounded-lg border shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Select Purchase Order</h2>
            <p className="text-sm text-gray-500">
              Choose a PO to restock against
            </p>
          </div>
          <div
            className="cursor-pointer hover:bg-gray-100 rounded p-1"
            onClick={onClose}
          >
            <XIcon />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </i>
          <input
            className="input-style-2 pl-9 w-full"
            placeholder="Search by PO#, supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Show:</span>
          {(
            [
              "NOT_DELIVERED",
              "PARTIAL",
              "FULLY_DELIVERED",
              "CANCELLED",
            ] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => toggleFilter(status)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeFilters.includes(status)
                  ? STATUS_COLORS[status]
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }`}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex flex-col overflow-hidden flex-1 border rounded-lg">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase">
            <div className="col-span-3">PO #</div>
            <div className="col-span-4">Supplier</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-72">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-gray-400">
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                No purchase orders found
              </div>
            ) : (
              filtered.map((po, idx) => (
                <div
                  key={po.purchase_Order_ID}
                  onClick={() => handleSelectPO(po)}
                  className={`grid grid-cols-12 gap-2 px-3 py-3 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                    idx !== filtered.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="col-span-3 font-medium text-xs">
                    {po.purchase_Order_Number}
                  </div>
                  <div className="col-span-4 text-gray-600 text-xs truncate">
                    {po.supplier.company_Name ||
                      `${po.supplier.first_Name} ${po.supplier.last_Name}`}
                  </div>
                  <div className="col-span-3 text-gray-500 text-xs">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(po.created_At))}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        STATUS_COLORS[po.status] ??
                        "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {STATUS_LABELS[po.status] ?? po.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

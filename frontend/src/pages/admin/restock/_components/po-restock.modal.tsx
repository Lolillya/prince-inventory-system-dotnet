import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  XIcon,
  SearchIcon,
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  BanIcon,
  CircleSlashIcon,
} from "@/icons";
import { useGetAllPurchaseOrdersQuery } from "@/features/purchase-order/purchase-order.query";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";

const FILTER_CONFIG = [
  {
    key: "NOT_DELIVERED",
    label: "Not Delivered",
    icon: FileTextIcon,
    count: "1,200",
    activeClasses: "border-blue-300 bg-blue-50 text-blue-700",
    statuses: ["NOT_DELIVERED"],
  },
  {
    key: "PARTIAL",
    label: "Partial",
    icon: ClockIcon,
    count: "2,300",
    activeClasses: "border-amber-300 bg-amber-50 text-amber-700",
    statuses: ["PARTIAL"],
  },
  {
    key: "FULLY_DELIVERED",
    label: "Fully Delivered",
    icon: CheckCircleIcon,
    count: "3,800",
    activeClasses: "border-green-300 bg-green-50 text-green-700",
    statuses: ["FULLY_DELIVERED"],
  },
  {
    key: "CANCELLED_NO_DEL",
    label: "Cancelled – No Delivery",
    icon: BanIcon,
    count: "1,100",
    activeClasses: "border-red-300 bg-red-50 text-red-700",
    statuses: ["CANCELLED"],
  },
  {
    key: "CANCELLED_AFTER",
    label: "Cancelled – After Partial Delivery",
    icon: CircleSlashIcon,
    count: "1,200",
    activeClasses: "border-purple-300 bg-purple-50 text-purple-700",
    statuses: ["CANCELLED"],
  },
];

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
    "FULLY_DELIVERED",
    "CANCELLED_NO_DEL",
    "CANCELLED_AFTER",
  ]);

  const toggleFilter = (status: string) => {
    setActiveFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const filtered = purchaseOrders.filter((po) => {
    const allowedStatuses = FILTER_CONFIG.filter((f) =>
      activeFilters.includes(f.key),
    ).flatMap((f) => f.statuses);

    if (!allowedStatuses.includes(po.status)) return false;

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
      <div className="w-[1200px] max-h-[80vh] bg-white px-8 py-6 rounded-lg border shadow-lg flex flex-col gap-4">
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

        {/* Status Filters */}
        <div>
          <p className="text-sm font-semibold mb-2">Status Filters</p>
          <div className="flex gap-2 justify-between">
            {FILTER_CONFIG.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => toggleFilter(filter.key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 text-nowrap max-w-full w-full${
                    activeFilters.includes(filter.key)
                      ? filter.activeClasses
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  <IconComponent width={16} height={16} />
                  {filter.label} ({filter.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Total count */}
        <p className="text-sm text-gray-500">
          Showing <strong className="text-blue-600">{filtered.length}</strong>{" "}
          purchase orders
        </p>

        {/* Table */}
        <div className="flex flex-col overflow-hidden flex-1 border rounded-lg">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-custom-gray text-xs font-semibold uppercase">
            <div className="col-span-3">PO #</div>
            <div className="col-span-4">Supplier</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-gray-400">
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                No purchase orders found
              </div>
            ) : (
              filtered.map((po, idx) => {
                const isFullyDelivered = po.status === "FULLY_DELIVERED";
                const isCancelledNoDelivery = po.status === "CANCELLED";

                return (
                  <div
                    key={po.purchase_Order_ID}
                    onClick={
                      isFullyDelivered || isCancelledNoDelivery
                        ? undefined
                        : () => handleSelectPO(po)
                    }
                    className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm transition-colors items-center ${
                      idx !== filtered.length - 1 ? "border-b" : ""
                    } ${isFullyDelivered ? "" : "cursor-pointer hover:bg-blue-50"}`}
                  >
                    <div className="col-span-3 font-medium text-xs">
                      {po.purchase_Order_Number}
                    </div>
                    <div className="col-span-4 text-gray-600 text-xs truncate">
                      {po.supplier.company_Name ||
                        `${po.supplier.first_Name} ${po.supplier.last_Name}`}
                    </div>
                    <div className="col-span-2 text-gray-500 text-xs">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(po.created_At))}
                    </div>
                    <div className="col-span-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                          STATUS_COLORS[po.status] ??
                          "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {(() => {
                          const config = FILTER_CONFIG.find((f) =>
                            f.statuses.includes(po.status),
                          );
                          const IconComponent = config?.icon ?? BanIcon;
                          return <IconComponent width={12} height={12} />;
                        })()}
                        {FILTER_CONFIG.find((f) =>
                          f.statuses.includes(po.status),
                        )?.label ?? po.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {!isFullyDelivered && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

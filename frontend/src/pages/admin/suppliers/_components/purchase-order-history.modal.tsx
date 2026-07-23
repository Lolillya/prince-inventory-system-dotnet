import {
  usePurchaseOrdersBySupplierQuery,
  useUpdatePurchaseOrderStatusMutation,
} from "@/features/purchase-order/purchase-order.query";
import {
  PurchaseOrderRecord,
  PurchaseOrderStatus,
} from "@/features/purchase-order/purchase-order.model";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { PurchaseOrderDetailsModal } from "./purchase-order-details.modal";
import { Ban, ChartPie, CircleCheck, FileText, Search } from "lucide-react";

interface PurchaseOrderHistoryModalProps {
  selectedSupplier: SupplierDataModel;
  setIsPurchaseOrderHistoryModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

type HistoryTab = "OPEN" | "CLOSED" | "ALL";

type DisplayStatus =
  | "NOT_DELIVERED"
  | "PARTIAL"
  | "FULLY_DELIVERED"
  | "CANCELLED_NO_DELIVERY"
  | "CANCELLED_AFTER_PARTIAL";

const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  NOT_DELIVERED: "Not Delivered",
  PARTIAL: "Partial Delivery",
  FULLY_DELIVERED: "Fully Delivered",
  CANCELLED_NO_DELIVERY: "Cancelled - No Delivery",
  CANCELLED_AFTER_PARTIAL: "Cancelled - After Partial Delivery",
};

const DISPLAY_STATUS_CLASSES: Record<DisplayStatus, string> = {
  NOT_DELIVERED: "bg-blue-100 text-blue-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  FULLY_DELIVERED: "bg-green-100 text-green-700",
  CANCELLED_NO_DELIVERY: "bg-gray-200 text-gray-700",
  CANCELLED_AFTER_PARTIAL: "bg-gray-200 text-gray-700",
};

const DISPLAY_STATUS_ICON: Partial<Record<DisplayStatus, typeof Ban>> = {
  NOT_DELIVERED: FileText,
  PARTIAL: ChartPie,
  FULLY_DELIVERED: CircleCheck,
  CANCELLED_NO_DELIVERY: Ban,
  CANCELLED_AFTER_PARTIAL: Ban,
};

const OPEN_STATUSES: DisplayStatus[] = ["NOT_DELIVERED", "PARTIAL"];
const CLOSED_STATUSES: DisplayStatus[] = [
  "FULLY_DELIVERED",
  "CANCELLED_NO_DELIVERY",
  "CANCELLED_AFTER_PARTIAL",
];

const getDisplayStatus = (po: PurchaseOrderRecord): DisplayStatus => {
  const status = po.status?.toUpperCase();

  if (status === "CANCELLED") {
    const hasReceivedAny = po.line_Items.some(
      (item) => Number(item.received_quantity || 0) > 0,
    );
    return hasReceivedAny ? "CANCELLED_AFTER_PARTIAL" : "CANCELLED_NO_DELIVERY";
  }

  if (
    status === "NOT_DELIVERED" ||
    status === "PARTIAL" ||
    status === "FULLY_DELIVERED"
  ) {
    return status;
  }

  return "NOT_DELIVERED";
};

const isOpenStatus = (status: DisplayStatus) => OPEN_STATUSES.includes(status);

export const PurchaseOrderHistoryModal = ({
  selectedSupplier,
  setIsPurchaseOrderHistoryModalOpen,
}: PurchaseOrderHistoryModalProps) => {
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrderRecord | null>(null);
  const [activeTab, setActiveTab] = useState<HistoryTab>("OPEN");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DisplayStatus | "ALL">(
    "ALL",
  );

  const { data: purchaseOrders = [], isLoading } =
    usePurchaseOrdersBySupplierQuery(selectedSupplier.supplier_Id);
  const { mutateAsync: updateStatus } = useUpdatePurchaseOrderStatusMutation(
    selectedSupplier.supplier_Id,
  );

  const decorated = useMemo(
    () =>
      purchaseOrders.map((po) => ({
        po,
        displayStatus: getDisplayStatus(po),
      })),
    [purchaseOrders],
  );

  const stats = useMemo(() => {
    const open = decorated.filter((d) => isOpenStatus(d.displayStatus)).length;
    const closed = decorated.length - open;
    const totalAmount = decorated.reduce(
      (acc, d) => acc + Number(d.po.grand_Total || 0),
      0,
    );

    return {
      total: decorated.length,
      open,
      closed,
      totalAmount,
    };
  }, [decorated]);

  const availableStatusFilters = useMemo(() => {
    if (activeTab === "OPEN") return OPEN_STATUSES;
    if (activeTab === "CLOSED") return CLOSED_STATUSES;
    return [...OPEN_STATUSES, ...CLOSED_STATUSES];
  }, [activeTab]);

  const filteredRows = useMemo(() => {
    return decorated
      .filter((d) => {
        if (activeTab === "OPEN") return isOpenStatus(d.displayStatus);
        if (activeTab === "CLOSED") return !isOpenStatus(d.displayStatus);
        return true;
      })
      .filter((d) =>
        statusFilter === "ALL" ? true : d.displayStatus === statusFilter,
      )
      .filter((d) =>
        searchTerm.trim()
          ? d.po.purchase_Order_Number
              .toLowerCase()
              .includes(searchTerm.trim().toLowerCase())
          : true,
      );
  }, [decorated, activeTab, statusFilter, searchTerm]);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleClose = () => {
    setIsPurchaseOrderHistoryModalOpen(false);
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "MM-dd-yyyy");
  };

  const handleTabChange = (tab: HistoryTab) => {
    setActiveTab(tab);
    setStatusFilter("ALL");
  };

  const handleCancelPurchaseOrder = async (purchaseOrderId: number) => {
    await updateStatus({
      purchaseOrderId,
      status: "CANCELLED" as PurchaseOrderStatus,
    });
  };

  const emptyMessage = {
    OPEN: "No Open PO found",
    CLOSED: "No Closed PO found",
    ALL: "No purchase orders found",
  }[activeTab];

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      {selectedPurchaseOrder && (
        <PurchaseOrderDetailsModal
          purchaseOrder={selectedPurchaseOrder}
          onClose={() => setSelectedPurchaseOrder(null)}
          onCancel={handleCancelPurchaseOrder}
          canCancel={isOpenStatus(getDisplayStatus(selectedPurchaseOrder))}
        />
      )}

      <div className="w-[980px] max-h-[90vh] overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Purchase Order History</h1>
            <p className="text-vesper-gray">
              Supplier: {selectedSupplier.company_Name}
            </p>
          </div>
          <div
            className="p-2 rounded hover:bg-gray-100 "
            onClick={handleClose}
            aria-label="Close purchase order history"
          >
            <XIcon />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Total PO</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Open PO</p>
            <p className="text-lg font-bold text-red-700">{stats.open}</p>
          </div>
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Closed PO</p>
            <p className="text-lg font-bold text-green-700">{stats.closed}</p>
          </div>
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">
              Total PO Amount
            </p>
            <p className="text-lg font-bold">
              {formatMoney(stats.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b">
          {(["OPEN", "CLOSED", "ALL"] as HistoryTab[]).map((tab) => (
            <div
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px cursor-pointer${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "OPEN"
                ? "Open PO"
                : tab === "CLOSED"
                  ? "Closed PO"
                  : "All"}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PO number"
              className="input-style-2"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as DisplayStatus | "ALL")
            }
            className="w-full sm:w-64 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="ALL">Filter by Status: All</option>
            {availableStatusFilters.map((status) => (
              <option key={status} value={status}>
                {DISPLAY_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase tracking-wide">
            <div className="col-span-3 text-left">PO #</div>
            <div className="col-span-2 text-left">Preferred Delivery</div>
            <div className="col-span-3 text-left">Status</div>
            <div className="col-span-2 text-left">Grand Total</div>
            <div className="col-span-2 text-left">Actions</div>
          </div>

          <div className="max-h-[56vh] overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-8 text-sm text-gray-500 text-center">
                Loading purchase orders...
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="px-3 py-8 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              filteredRows.map(({ po, displayStatus }) => (
                <div
                  key={po.purchase_Order_ID}
                  className="border-b last:border-b-0 px-3 py-3"
                >
                  <div className="grid grid-cols-12 gap-2 text-sm items-center">
                    <div className="col-span-3 text-left font-semibold">
                      {po.purchase_Order_Number}
                    </div>
                    <div className="col-span-2 text-left">
                      {formatDate(po.preferred_Delivery)}
                    </div>
                    <div className="col-span-3 text-left">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap w-fit flex items-center gap-2 ${DISPLAY_STATUS_CLASSES[displayStatus]}`}
                      >
                        {(() => {
                          const StatusIcon = DISPLAY_STATUS_ICON[displayStatus];
                          return StatusIcon ? <StatusIcon size={14} /> : null;
                        })()}
                        {DISPLAY_STATUS_LABEL[displayStatus]}
                      </span>
                    </div>
                    <div className="col-span-2 text-left font-medium">
                      {formatMoney(Number(po.grand_Total || 0))}
                    </div>
                    <div className="col-span-2 text-left">
                      <button
                        className="px-3 py-1 text-xs rounded-md border"
                        onClick={() => setSelectedPurchaseOrder(po)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-sm rounded-md border"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </section>
  );
};

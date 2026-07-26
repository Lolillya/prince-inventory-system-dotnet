import { PurchaseOrderRecord } from "./purchase-order.model";
import { Ban, ChartPie, CircleCheck, FileText } from "lucide-react";

export type DisplayStatus =
  | "NOT_DELIVERED"
  | "PARTIAL"
  | "FULLY_DELIVERED"
  | "CANCELLED_NO_DELIVERY"
  | "CANCELLED_AFTER_PARTIAL";

export const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  NOT_DELIVERED: "Not Delivered",
  PARTIAL: "Partial Delivery",
  FULLY_DELIVERED: "Fully Delivered",
  CANCELLED_NO_DELIVERY: "Cancelled - No Delivery",
  CANCELLED_AFTER_PARTIAL: "Cancelled - After Partial Delivery",
};

export const DISPLAY_STATUS_CLASSES: Record<DisplayStatus, string> = {
  NOT_DELIVERED: "bg-blue-100 text-blue-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  FULLY_DELIVERED: "bg-green-100 text-green-700",
  CANCELLED_NO_DELIVERY: "bg-gray-200 text-gray-700",
  CANCELLED_AFTER_PARTIAL: "bg-gray-200 text-gray-700",
};

export const DISPLAY_STATUS_ICON: Partial<Record<DisplayStatus, typeof Ban>> = {
  NOT_DELIVERED: FileText,
  PARTIAL: ChartPie,
  FULLY_DELIVERED: CircleCheck,
  CANCELLED_NO_DELIVERY: Ban,
  CANCELLED_AFTER_PARTIAL: Ban,
};

export const OPEN_STATUSES: DisplayStatus[] = ["NOT_DELIVERED", "PARTIAL"];
export const CLOSED_STATUSES: DisplayStatus[] = [
  "FULLY_DELIVERED",
  "CANCELLED_NO_DELIVERY",
  "CANCELLED_AFTER_PARTIAL",
];

// Live status derivation per spec:
// Valid Received Quantity = sum(valid, non-reversed restocks)
// NOT_DELIVERED -> valid received == 0
// PARTIAL -> valid received > 0 and outstanding > 0
// FULLY_DELIVERED -> outstanding == 0
// CANCELLED - No Delivery -> valid received == 0 at time of cancellation
// CANCELLED - After Partial Delivery -> valid received > 0 at time of cancellation
export const getDisplayStatus = (po: PurchaseOrderRecord): DisplayStatus => {
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

export const isOpenStatus = (status: DisplayStatus) =>
  OPEN_STATUSES.includes(status);

// Distinct product+preset combos count as separate "products" per spec.
export const countDistinctProducts = (po: PurchaseOrderRecord) => {
  const keys = new Set(
    po.line_Items.map((li) => `${li.product_ID}::${li.preset_ID ?? "none"}`),
  );
  return keys.size;
};

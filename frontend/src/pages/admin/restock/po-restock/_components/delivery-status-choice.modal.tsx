import { PORestockDeliveryStatus } from "@/features/restock/models/po-restock.model";

interface DeliveryStatusChoiceModalProps {
  isPending: boolean;
  onClose: () => void;
  onChoose: (status: PORestockDeliveryStatus) => void;
}

export const DeliveryStatusChoiceModal = ({
  isPending,
  onClose,
  onChoose,
}: DeliveryStatusChoiceModalProps) => {
  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-[60]">
      <div className="w-[480px] bg-white px-8 py-7 rounded-lg border shadow-xl flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold">Mark Delivery Status</h2>
          <p className="text-sm text-gray-500 mt-1">
            How would you like to mark this delivery?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Partial */}
          <button
            disabled={isPending}
            onClick={() => onChoose("PARTIAL")}
            className="text-left p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors disabled:opacity-50"
          >
            <div className="font-semibold text-yellow-800">
              Mark as Partial Delivery
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              The PO stays open. Remaining quantities are remembered and will be
              pre-filled the next time you restock from this PO.
            </p>
          </button>

          {/* Fully delivered */}
          <button
            disabled={isPending}
            onClick={() => onChoose("FULLY_DELIVERED")}
            className="text-left p-4 rounded-lg border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <div className="font-semibold text-green-800">
              Mark as Fully Delivered
            </div>
            <p className="text-xs text-green-700 mt-1">
              Received items are added to inventory. Any remaining undelivered
              quantities are waived. This PO will be closed and cannot be
              reopened.
            </p>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            className="text-sm text-gray-500 hover:underline"
            onClick={onClose}
            disabled={isPending}
          >
            Go back
          </button>
        </div>
      </div>
    </section>
  );
};

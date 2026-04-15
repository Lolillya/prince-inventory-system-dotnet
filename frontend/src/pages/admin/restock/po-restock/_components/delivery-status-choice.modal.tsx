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
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      <div className="w-[480px] bg-white px-8 py-7 rounded-lg border shadow-xl flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold">Mark Delivery Status</h2>
          <p className="text-sm text-gray-500 mt-1">
            How would you like to mark this delivery?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-300 rounded-full shrink-0" />
              <label className="font-semibold text-yellow-800 text-sm">
                Partial
              </label>
            </div>
            <p className="text-xs text-yellow-700">
              The PO stays open. Remaining quantities are remembered and will be
              pre-filled the next time you restock from this PO.
            </p>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg ">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 rounded-full shrink-0" />
              <label className="font-semibold text-green-800 text-sm">
                Complete
              </label>
            </div>
            <p className="text-xs text-green-700">
              Received items are added to inventory. Any remaining undelivered
              quantities are waived. This PO will be closed and cannot be
              reopened.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Partial */}
          <button
            disabled={isPending}
            onClick={() => onChoose("PARTIAL")}
            className="text-left p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-all duration-300 disabled:opacity-50 w-full max-w-full"
          >
            <div className="font-semibold text-yellow-800">
              Mark as Partial Delivery
            </div>
          </button>

          {/* Fully delivered */}
          <button
            disabled={isPending}
            onClick={() => onChoose("FULLY_DELIVERED")}
            className="text-left p-4 rounded-lg border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-all duration-300 disabled:opacity-50 w-full max-w-full"
          >
            <div className="font-semibold text-green-800">
              Mark as Fully Delivered
            </div>
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

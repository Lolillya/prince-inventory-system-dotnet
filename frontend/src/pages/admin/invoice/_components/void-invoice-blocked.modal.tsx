import { Separator } from "@/components/separator";
import { TriangleAlert, X } from "lucide-react";

interface VoidInvoiceBlockedModalProps {
  activePaymentCount: number;
  activePaymentTotal: number;
  onClose: () => void;
}

export const VoidInvoiceBlockedModal = ({
  activePaymentCount,
  activePaymentTotal,
  onClose,
}: VoidInvoiceBlockedModalProps) => {
  return (
    <section className="fixed bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl border shadow-lg">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-50 shrink-0">
              <TriangleAlert className="text-red-500" size={28} />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-2xl font-bold">Unable to void this invoice.</h3>
              <span className="text-vesper-gray">
                This invoice has applied payments.
              </span>
              <span className="text-vesper-gray">
                Invalidate all applied payments before voiding the invoice.
              </span>
            </div>

            <div
              className="p-2 rounded-md cursor-pointer duration-300 transition-all hover:bg-gray-100 shrink-0"
              onClick={onClose}
            >
              <X />
            </div>
          </div>

          <Separator orientation="horizontal" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Applied Payments:</span>
              <span className="font-bold text-red-500">
                {activePaymentCount}
              </span>
              <span>
                active {activePaymentCount === 1 ? "entry" : "entries"} (₱
                {activePaymentTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                )
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Required to Void:</span>
              <span className="font-bold">0</span>
              <span>active payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

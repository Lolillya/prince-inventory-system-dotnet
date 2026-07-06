import { Separator } from "@/components/separator";
import { InsufficientVoidRestockItem } from "@/features/restock/void-restock.service";
import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Cross,
  Package,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";

interface Props {
  insufficientItems: InsufficientVoidRestockItem[];
  onClose: () => void;
}

export const InsufficientInventoryModal = ({
  insufficientItems,
  onClose,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-lg p-6 flex flex-col gap-2 relative">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded-full bg-red-100 h-fit shrink-0">
            <CircleAlert className="text-red-600" size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">
              Unable to Undo this Restock
            </h3>
            <p className="text-sm text-vesper-gray">
              There isn't enough inventory available to fully reverse this
              restock.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex item-center gap-2">
          <div className="p-1 rounded-md bg-red-50 w-fit h-fit">
            <Package className="text-red-500" size={28} />
          </div>

          <label>
            <span className="text-red-600 mr-1 font-bold">
              {insufficientItems.length}
            </span>
            products have insufficient inventory to complete the undo.
          </label>
        </div>

        <Separator />

        <div className="flex flex-col">
          {isExpanded &&
            insufficientItems.map((item) => (
              <div
                className="flex items-center gap-2 py-2 border-b pb-6"
                key={item.productId}
              >
                <div className="bg-gray-50 rounded-md p-2 h-fit w-fit">
                  <Package className="text-vesper-gray" />
                </div>

                <div className="flex flex-col gap-1 font-semibold">
                  <span>{item.productName}</span>
                  <div className="text-xs flex gap-2">
                    <label>
                      Available:{" "}
                      <span className="text-red-500 font-bold">
                        {item.availableQuantity}
                      </span>
                    </label>

                    <div className="h-4 border-l-2" />

                    <label>Required: {item.requiredQuantity}</label>
                  </div>
                </div>
              </div>
            ))}
          <div
            className=" w-fit self-center flex items-center text-xs gap-1 font-semibold justify-center pt-4  text-vesper-gray hover:border-b transition-colors cursor-pointer"
            onClick={() => setIsExpanded((o) => !o)}
          >
            <span>View Details</span>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <div className="flex justify-end absolute top-0 right-0 p-2">
          <button
            className="w-fit! max-w-none! px-2 py-2 bg-white! text-black! hover:bg-gray-100! hover:shadow-none! hover:brightness-100! rounded-md"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
      </div>
    </section>
  );
};

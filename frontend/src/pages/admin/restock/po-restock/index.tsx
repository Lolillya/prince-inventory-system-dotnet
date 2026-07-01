import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPurchaseOrderByIdQuery } from "@/features/purchase-order/purchase-order.query";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { RestockCard2 } from "../new-restock/_components/restock-card-copy";
import { PORestockConfirmModal } from "./_components/po-restock-confirm.modal";
import { ArrowLeft, Truck } from "lucide-react";

export type PORestockCardState = {
  lineItemId: number;
  productId: number;
  presetId: number;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  receivingQuantity: number;
  removed: boolean;
};

/**
 * Construct a minimal InventoryProductModel from a PO line item.
 * Used to feed RestockCard2 in locked-preset mode.
 */
function buildFakeProduct(
  li: PurchaseOrderRecord["line_Items"][0],
): InventoryProductModel {
  const presetLevels =
    li.unit_Preset?.preset_Levels.map((l, idx) => ({
      conversion_Factor: 1,
      created_At: "",
      level: l.level,
      level_ID: idx,
      unitOfMeasure: { uom_ID: idx, uom_Name: l.uom_Name },
      uoM_ID: idx,
      preset_ID: li.preset_ID ?? 0,
    })) ?? [];

  return {
    product: {
      product_ID: li.product_ID,
      product_Code: "",
      product_Name: li.product?.product_Name ?? "",
      description: "",
      quantity: 0,
      createdAt: "",
      updatedAt: "",
    },
    brand: {
      brand_ID: 0,
      brandName: li.product?.brand ?? "",
      createdAt: "",
      updatedAt: "",
    },
    variant: {
      variant_ID: 0,
      variant_Name: li.product?.variant ?? "",
      createdAt: "",
      updatedAt: "",
    },
    category: {
      category_ID: 0,
      category_Name: li.product?.category ?? "",
      createdAt: "",
      updatedAt: "",
    },
    unitPresets: li.preset_ID
      ? [
          {
            assigned_At: "",
            preset_ID: li.preset_ID,
            product_Preset_ID: 0,
            presetPricing: [],
            preset: {
              preset_ID: li.preset_ID,
              preset_Code: li.unit_Preset?.preset_Code ?? "",
              main_Unit_ID: 0,
              created_At: "",
              updated_At: "",
              presetLevels,
            },
          },
        ]
      : [],
    isComplete: false,
    isFavorited: false,
    isSetupComplete: false,
    restockInfo: [],
  };
}

const PORestockPage = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading } = useGetPurchaseOrderByIdQuery(
    poId ? Number(poId) : undefined,
  );

  const [cards, setCards] = useState<PORestockCardState[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notes, setNotes] = useState("");

  console.log(po);

  useEffect(() => {
    if (!po) return;
    setCards(
      po.line_Items
        .filter((li) => li.preset_ID !== null)
        .map((li) => ({
          lineItemId: li.purchase_Order_LineItem_ID,
          productId: li.product_ID,
          presetId: li.preset_ID!,
          orderedQuantity: li.quantity,
          receivedQuantity: li.received_quantity ?? 0,
          remainingQuantity: li.remaining_quantity ?? li.quantity,
          receivingQuantity: li.remaining_quantity ?? li.quantity,
          removed: false,
        })),
    );
  }, [po]);

  if (isLoading)
    return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (!po)
    return (
      <div className="p-8 text-sm text-red-400">Purchase order not found.</div>
    );

  const handleQuantityChange = (lineItemId: number, qty: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.lineItemId === lineItemId ? { ...c, receivingQuantity: qty } : c,
      ),
    );
  };

  const handleRemove = (lineItemId: number) => {
    setCards((prev) =>
      prev.map((c) =>
        c.lineItemId === lineItemId
          ? { ...c, removed: true, receivingQuantity: 0 }
          : c,
      ),
    );
  };

  const activeCards = cards.filter((c) => !c.removed);

  const readyItemsCount = activeCards.filter(
    (c) => c.receivingQuantity > 0,
  ).length;

  const allItemsReady =
    activeCards.length > 0 && readyItemsCount === activeCards.length;

  return (
    <section className="relative">
      {isConfirmOpen && (
        <PORestockConfirmModal
          po={po}
          cards={cards}
          notes={notes}
          onNotesChange={setNotes}
          onClose={() => setIsConfirmOpen(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-gray-200">
        <div
          onClick={() => navigate("/admin/restock")}
          className="text-gray-500 hover:text-gray-700 flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">PO Restock</h1>
            <span className="text-gray-500 font-medium">
              #{po.purchase_Order_Number}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs bg-yellow-50 text-yellow-600 px-3 py-0.5 rounded-full border border-yellow-200 font-medium">
              Partial
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <Truck className="w-4 h-4" />
            <span>
              {po.supplier.company_Name ||
                `${po.supplier.first_Name} ${po.supplier.last_Name}`}
            </span>
          </div>
        </div>
      </div>

      {activeCards.length === 0 ? (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border-border border shadow-sm px-4 py-2 bg-white">
          <label className="text-sm font-medium">No items added</label>
        </div>
      ) : (
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border shadow-sm px-4 py-2 z-10 transition-colors ${
            allItemsReady
              ? "bg-green-50 border-green-400"
              : "bg-white border-border"
          }`}
        >
          <label
            className={`text-sm font-medium ${allItemsReady ? "text-green-700" : ""}`}
          >
            {readyItemsCount}/{activeCards.length} product
            {activeCards.length !== 1 ? "s" : ""} ready for restock
          </label>
        </div>
      )}

      {/* Cards grid */}
      {activeCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-sm text-gray-400">
          <p>All items have been removed.</p>
          <button
            className="mt-4 text-blue-500 hover:underline"
            onClick={() => navigate("/admin/restock")}
          >
            Go back to Restock
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-auto h-full">
          {cards
            .filter((c) => !c.removed)
            .map((card) => {
              const li = po.line_Items.find(
                (l) => l.purchase_Order_LineItem_ID === card.lineItemId,
              );
              if (!li) return null;

              const fakeProduct = buildFakeProduct(li);
              // Inject selectedPreset so RestockCard2 initializes with the pre-set values
              (fakeProduct as any).selectedPreset = {
                preset_ID: card.presetId,
                main_Unit_Quantity: card.receivingQuantity,
                levelPricing: [],
              };

              return (
                <RestockCard2
                  key={card.lineItemId}
                  product={fakeProduct}
                  itemId={String(card.lineItemId)}
                  isPresetLocked
                  onQuantityChange={(qty) =>
                    handleQuantityChange(card.lineItemId, qty)
                  }
                  onRemove={() => handleRemove(card.lineItemId)}
                />
              );
            })}
        </div>
      )}

      {/* Footer action */}
      {activeCards.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            disabled={!allItemsReady}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              allItemsReady
                ? " text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={() => setIsConfirmOpen(true)}
          >
            Continue
          </button>
        </div>
      )}
    </section>
  );
};

export default PORestockPage;

import { useAuth } from "@/context/use-auth";
import {
  useUnitPresetRestockItems,
  useUnitPresetRestock,
  useCreateUnitPresetRestock,
} from "@/features/restock/unit-preset-restock.query";
import { useSelectedRestockSupplier } from "@/features/restock/selected-supplier";

export const RestockTable = () => {
  const { data: items = [] } = useUnitPresetRestockItems();
  const { getPayload } = useUnitPresetRestock();
  const { mutate: createRestock, isPending } = useCreateUnitPresetRestock();
  const { data: supplier } = useSelectedRestockSupplier();
  const { user } = useAuth();

  const handleCreateRestock = async () => {
    if (!items || items.length === 0) {
      alert("Add items for restock!");
      return;
    }

    if (!supplier) {
      alert("Please select a supplier!");
      return;
    }

    if (!user) {
      alert("User not authenticated!");
      return;
    }

    const payload = getPayload();

    const restockPayload = {
      lineItems: payload.lineItems,
      supplier_ID: supplier.id,
      restock_Clerk: user.user_ID,
      notes: "",
    };

    createRestock(restockPayload);
  };

  const calculateSubtotal = (item: (typeof items)[0]) => {
    if (!item.selectedPreset) return 0;

    // Calculate based on main unit quantity and main unit price
    const mainPrice =
      item.selectedPreset.levelPricing.find((lp) => lp.level === 1)
        ?.price_Per_Unit || 0;
    return mainPrice * item.selectedPreset.main_Unit_Quantity;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      {/* TABLE DATA HEADERS */}
      <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
        <label className="text-left w-full">Item</label>
        <label className="text-left w-full">Preset</label>
        <label className="text-left w-full">Quantity</label>
        <label className="text-right w-full">Unit Price</label>
        <label className="text-right w-full">Subtotal</label>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {items
          .filter((item) => item.selectedPreset)
          .map((item, i) => {
            const preset = item.unitPresets.find(
              (p) => p.preset_ID === item.selectedPreset?.preset_ID
            );
            const mainUnitPrice =
              item.selectedPreset?.levelPricing.find((lp) => lp.level === 1)
                ?.price_Per_Unit || 0;
            const subtotal = calculateSubtotal(item);

            return (
              <div
                className={`py-3 px-5 flex justify-between text-sm gap-2 rounded-lg items-center ${i % 2 !== 0 && "bg-custom-gray"}`}
                key={i}
              >
                <span className="text-left w-full">
                  <div>
                    <span>{item.product.product_Name}</span>
                    <span> - </span>
                    <span>{item.brand.brand_Name}</span>
                    <span> - </span>
                    <span>{item.variant.variant_Name}</span>
                  </div>
                </span>
                <span className="text-left w-full">
                  {preset?.preset.presetLevels
                    .map((l) => l.unitOfMeasure.uom_Name)
                    .join(" → ")}
                </span>
                <span className="text-left w-full">
                  {item.selectedPreset?.main_Unit_Quantity}{" "}
                  {preset?.preset.presetLevels[0].unitOfMeasure.uom_Name}
                </span>
                <span className="text-right w-full">
                  ₱ {mainUnitPrice.toFixed(2)}
                </span>
                <span className="text-right w-full">
                  ₱ {subtotal.toFixed(2)}
                </span>
              </div>
            );
          })}
      </div>

      {items.length > 10 && (
        <span className="text-vesper-gray text-xs">
          Note: This order includes more than 10 items. We'll move the
          additional items to new invoices accordingly.
        </span>
      )}

      <div className="flex justify-between">
        <div className="flex flex-col">
          <div className="flex gap-2 font-bold tracking-wider">
            <span>TOTAL: </span>
            <label>₱ {calculateTotal().toFixed(2)}</label>
          </div>
        </div>

        <button onClick={handleCreateRestock} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

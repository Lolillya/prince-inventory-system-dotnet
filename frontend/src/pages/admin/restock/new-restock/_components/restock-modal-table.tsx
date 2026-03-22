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

  const handleCreateRestock_2 = async () => {};

  const calculateTotalQuantity = () => {
    // Sum all subtotals for items with selected presets
    return items
      .filter((item) => (item as any).selectedPreset)
      .reduce((total, item) => {
        const typedItem = item as any;
        return total + (typedItem.selectedPreset?.main_Unit_Quantity || 0);
      }, 0);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      {/* TABLE DATA HEADERS */}
      <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
        <label className="text-left w-full uppercase text-xs font-semibold">
          Item
        </label>
        <label className="text-left w-[70%] uppercase text-xs font-semibold">
          Conversion
        </label>
        <label className="text-left w-[30%] uppercase text-xs font-semibold">
          Quantity
        </label>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {items
          .filter((item) => (item as any).selectedPreset)
          .map((item, i) => {
            const typedItem = item as any;
            const preset = item.unitPresets.find(
              (p) => p.preset_ID === typedItem.selectedPreset?.preset_ID,
            );

            return (
              <div
                className={`py-3 px-5 flex justify-between text-sm gap-2 rounded-lg items-center ${i % 2 !== 0 && "bg-custom-gray"}`}
                key={i}
              >
                <span className="text-left w-full">
                  <div>
                    <span>{item.product.product_Name}</span>
                    <span> - </span>
                    <span>{item.brand.brandName}</span>
                    <span> - </span>
                    <span>{item.variant.variant_Name}</span>
                  </div>
                </span>
                <span className="text-left w-[70%]">
                  {preset?.preset.presetLevels
                    .map((l) => l.unitOfMeasure.uom_Name)
                    .join(" → ")}
                </span>
                <span className="text-left w-[30%]">
                  {typedItem.selectedPreset?.main_Unit_Quantity}{" "}
                  {preset?.preset.presetLevels[0].unitOfMeasure.uom_Name}
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
            <span>TOTAL PRODUCTS: </span>
            <label>
              {items.filter((item) => (item as any).selectedPreset).length}
            </label>
          </div>
          <div className="flex gap-2 font-bold tracking-wider">
            <span>TOTAL QUANTITY: </span>
            <label>{calculateTotalQuantity()}</label>
          </div>
        </div>

        <button onClick={handleCreateRestock} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

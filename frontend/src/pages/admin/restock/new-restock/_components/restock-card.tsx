import { Separator } from "@/components/separator";
import { useSelectedRestock } from "@/features/restock/selected-restock";
import { PlusIcon, RightArrowIcon, XIcon } from "@/icons";
import { InventoryProductModel } from "@/models/inventory.model";
import { UnitModel } from "@/models/uom.model";
import { UnitConversion } from "@/models/unit-conversion.model";
import { useState } from "react";

interface RestockCardProp {
  onClick?: () => void;
  product: InventoryProductModel;
  onRemove?: () => void;
  units: UnitModel[];
}

const RestockCard = ({ product, onRemove, units }: RestockCardProp) => {
  const {
    UPDATE_RESTOCK_QUANTITY,
    UPDATE_RESTOCK_UNIT_PRICE,
    UPDATE_RESTOCK_UNIT,
    ADD_UNIT_CONVERSION,
    UPDATE_UNIT_CONVERSION,
    REMOVE_UNIT_CONVERSION,
  } = useSelectedRestock();

  const [selectedUnit, setSelectedUnit] = useState<string>(
    units[0]?.uom_Name || ""
  );

  const [conversions, setConversions] = useState<UnitConversion[]>([]);

  const handleChangeUnit = (unit: string) => {
    UPDATE_RESTOCK_UNIT(
      product.product.product_ID,
      unit,
      product.variant.variantName
    );
    setSelectedUnit(unit);
  };

  const handleAddConversion = () => {
    const newConversion: UnitConversion = {
      id: `conv-${Date.now()}-${Math.random()}`,
      fromUnit: units[0]?.uom_Name || "",
      toUnit: units[0]?.uom_Name || "",
      conversionFactor: 1,
      quantity: 0,
      price: 0,
    };
    setConversions([...conversions, newConversion]);
    ADD_UNIT_CONVERSION(
      product.product.product_ID,
      newConversion,
      product.variant.variantName
    );
  };

  const handleUpdateConversion = (
    conversionId: string,
    updates: Partial<UnitConversion>
  ) => {
    setConversions(
      conversions.map((c) => (c.id === conversionId ? { ...c, ...updates } : c))
    );
    UPDATE_UNIT_CONVERSION(
      product.product.product_ID,
      conversionId,
      updates,
      product.variant.variantName
    );
  };

  const handleRemoveConversion = (conversionId: string) => {
    setConversions(conversions.filter((c) => c.id !== conversionId));
    REMOVE_UNIT_CONVERSION(
      product.product.product_ID,
      conversionId,
      product.variant.variantName
    );
  };

  return (
    <div className="p-5 border shadow-lg rounded-lg h-fit w-full max-w-[30rem] text-xs">
      <div className="flex gap-2 items-center text-xs justify-between">
        <div>
          <span>{product.product.productName}</span>
          <span>-</span>
          <span>{product.brand.brandName}</span>
          <span>-</span>
          <span>{product.variant.variantName}</span>
        </div>

        <div
          className="cursor-pointer hover:bg-gray-200 rounded p-1"
          onClick={onRemove}
        >
          <XIcon />
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div className="flex gap-1">
        <div className="flex flex-col gap-1">
          <label>stock</label>
          <input
            placeholder="qty"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            onChange={(e) =>
              UPDATE_RESTOCK_QUANTITY(
                product.product.product_ID,
                Number(e.target.value),
                product.variant.variantName
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label>price</label>
          <input
            placeholder="0.00"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            onChange={(e) =>
              UPDATE_RESTOCK_UNIT_PRICE(
                product.product.product_ID,
                Number(e.target.value),
                product.variant.variantName
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label>unit</label>
          <select
            className="rounded-lg w-full p-2 text-sm drop-shadow-none bg-custom-bg-white"
            value={selectedUnit}
            onChange={(e) => handleChangeUnit(e.target.value)}
          >
            {units.map((u, i) => (
              <option value={u.uom_Name} key={i}>
                {u.uom_Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div className="flex flex-col gap-2">
        {conversions.map((conversion) => (
          <div key={conversion.id} className="flex gap-1 items-center">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs">stock</label>
              <input
                type="number"
                placeholder="qty"
                className="rounded-lg drop-shadow-none w-full bg-custom-bg-white p-2 text-xs"
                value={conversion.quantity || ""}
                onChange={(e) =>
                  handleUpdateConversion(conversion.id, {
                    quantity: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs">price</label>
              <input
                type="number"
                placeholder="0.00"
                className="rounded-lg drop-shadow-none w-full bg-custom-bg-white p-2 text-xs"
                value={conversion.price || ""}
                onChange={(e) =>
                  handleUpdateConversion(conversion.id, {
                    price: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs">from unit</label>
              <select
                className="rounded-lg w-full p-2 text-xs drop-shadow-none bg-custom-bg-white"
                value={conversion.fromUnit}
                onChange={(e) =>
                  handleUpdateConversion(conversion.id, {
                    fromUnit: e.target.value,
                  })
                }
              >
                {units.map((u, i) => (
                  <option value={u.uom_Name} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <RightArrowIcon />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs">factor</label>
              <input
                type="number"
                placeholder="qty"
                className="rounded-lg drop-shadow-none w-full bg-custom-bg-white p-2 text-xs"
                value={conversion.conversionFactor}
                onChange={(e) =>
                  handleUpdateConversion(conversion.id, {
                    conversionFactor: Number(e.target.value) || 1,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs">to unit</label>
              <select
                className="rounded-lg p-2 text-xs w-full bg-custom-bg-white"
                value={conversion.toUnit}
                onChange={(e) =>
                  handleUpdateConversion(conversion.id, {
                    toUnit: e.target.value,
                  })
                }
              >
                {units.map((u, i) => (
                  <option value={u.uom_Name} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="mt-5 cursor-pointer hover:bg-gray-200 rounded p-1"
              onClick={() => handleRemoveConversion(conversion.id)}
            >
              <XIcon />
            </div>
          </div>
        ))}

        <div className="flex gap-1 items-center">
          <div
            className="text-xs cursor-pointer hover:bg-gray-200 rounded p-1"
            onClick={handleAddConversion}
          >
            <PlusIcon />
          </div>
          <span className="text-xs text-vesper-gray">Add unit conversion</span>
        </div>
      </div>
    </div>
  );
};

export default RestockCard;

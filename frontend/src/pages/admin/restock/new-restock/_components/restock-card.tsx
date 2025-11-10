import { Separator } from "@/components/separator";
import { useSelectedRestock } from "@/features/restock/selected-restock";
import { PlusIcon, RightArrowIcon, XIcon } from "@/icons";
import { InventoryProductModel } from "@/models/inventory.model";
import { UnitModel } from "@/models/uom.model";
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
  } = useSelectedRestock();

  const [selectedUnit, setSelectedUnit] = useState<string>(
    units[0]?.uom_Name || ""
  );

  const handleChangeUnit = (unit: string) => {
    UPDATE_RESTOCK_UNIT(
      product.product.product_ID,
      unit,
      product.variant.variantName
    );
    setSelectedUnit(unit);
  };

  return (
    <div className="p-5 border shadow-lg rounded-lg h-fit w-full max-w-[35rem] text-xs">
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

      <div className="flex gap-1">
        <div className="flex flex-col gap-1">
          <label>stock</label>
          <input
            placeholder="qty"
            className="w-full drop-shadow-none bg-custom-bg-white p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label>price</label>
          <input
            placeholder="0.00"
            className="w-full drop-shadow-none bg-custom-bg-white p-2"
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label>unit conversion</label>
          <div className="flex gap-1 items-center">
            <div className="">
              <select className="rounded-lg w-full p-2 text-xs drop-shadow-none bg-custom-bg-white">
                {units.map((u, i) => (
                  <option value={u.uom_Name} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <RightArrowIcon />
            </div>

            <div className="flex">
              <input
                placeholder="qty"
                className="rounded-r-none drop-shadow-none w-full bg-custom-bg-white p-2"
              />
              <select className="rounded-r-lg p-2 text-xs w-full bg-custom-bg-white">
                {units.map((u, i) => (
                  <option value={u.uom_Name} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs">
              <PlusIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockCard;

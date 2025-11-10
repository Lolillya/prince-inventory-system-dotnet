import { Separator } from "@/components/separator";
import {
  useSelectedInvoiceProduct,
  useSelectedProductInvoiceQuery,
} from "@/features/invoice/selected-product";
import { ChevronDownIcon, PlusIcon, XIcon } from "@/icons";
import { InventoryProductModel } from "@/models/inventory.model";
import { UnitModel } from "@/models/uom.model";
import { useState } from "react";

interface InvoiceCardProp {
  onClick?: () => void;
  product: InventoryProductModel;
  onRemove?: () => void;
  units: UnitModel[];
}

enum DiscountEnum {
  MANUAL = "",
  PERCENTAGE = "%",
}

export const InvoiceCard = ({ product, onRemove, units }: InvoiceCardProp) => {
  const {
    updateInvoiceQuantityByKey,
    UPDATE_INVOICE_UNIT_PRICE,
    UPDATE_INVOICE_UNIT,
    updateInvoiceDiscountByKey,
  } = useSelectedInvoiceProduct();
  const { data: selelctedInvoice } = useSelectedProductInvoiceQuery();

  const [discount, setDiscount] = useState<DiscountEnum>(DiscountEnum.MANUAL);
  const [selectedUnit, setSelectedUnit] = useState<string>(
    units[0]?.uom_Name || ""
  );

  const calculateTotal = () => {
    const item =
      selelctedInvoice && selelctedInvoice.length > 0
        ? selelctedInvoice[0].invoice
        : null;
    if (!item) return "";

    const subtotal = item.unit_quantity * item.unit_price;

    if (discount === DiscountEnum.MANUAL) return subtotal - item.discount;

    if (discount === DiscountEnum.PERCENTAGE)
      return subtotal - (subtotal * item.discount) / 100;

    return subtotal;
  };

  const handleChangeUnit = (unit: string) => {
    UPDATE_INVOICE_UNIT(
      product.product.product_ID,
      unit,
      product.variant.variantName
    );

    setSelectedUnit(unit);
  };

  return (
    <div className="p-5 border shadow-lg rounded-lg h-fit w-full max-w-[30rem] text-xs">
      <div className="flex gap-2 items-center text-xs justify-between">
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 bg-orange-300 rounded-full" />
          <span>{product.product.productName}</span>
          <span>{product.brand.brandName}</span>
          <span>{product.variant.variantName}</span>
        </div>
        <div
          onClick={onRemove}
          className="cursor-pointer hover:bg-gray-200 rounded p-1"
        >
          <XIcon />
        </div>
      </div>

      <div className="bg-custom-bg-white p-2 w-full rounded-lg flex items-center justify-between">
        <span>Add Batch</span>
        <div className="bg-white p-1 rounded-lg">
          <PlusIcon />
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end">
          <ChevronDownIcon />
        </div>

        <div className="flex flex-col">
          <span>quantity</span>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <input
                className="drop-shadow-none rounded-r-none bg-custom-gray w-full"
                onChange={(e) =>
                  updateInvoiceQuantityByKey(
                    product.product.product_ID,
                    Number(e.target.value),
                    product.variant.variantName
                  )
                }
              />
              <select
                className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                value={selectedUnit}
                onChange={(e) => handleChangeUnit(e.target.value)}
              >
                {units.map((u, i) => (
                  <option key={i} value={u.uom_Name}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
            </div>
            {/* <span>not enough stock in batch</span> */}
          </div>
        </div>

        {/* <div className="flex flex-col">
          <span>auto restock</span>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <input
                placeholder="20"
                className="drop-shadow-none rounded-r-none bg-gray-bg"
              />
              <input
                placeholder="boxes"
                className="drop-shadow-none rounded-l-none border-l-black border-l bg-gray-bg"
              />
            </div>
          </div>
        </div> */}

        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2">
            <span>item price</span>
          </div>
          <XIcon />
        </div>

        <div className="flex flex-col">
          <span>pricing</span>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <input
                className="drop-shadow-none rounded-r-none bg-custom-gray w-full"
                onChange={(e) =>
                  UPDATE_INVOICE_UNIT_PRICE(
                    product.product.product_ID,
                    Number(e.target.value),
                    product.variant.variantName
                  )
                }
              />
              <select
                className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                // value={discount}
                // onChange={(e) => setDiscount(e.target.value as DiscountEnum)}
              >
                <option value={DiscountEnum.PERCENTAGE}>Supplier Price</option>
                <option value={DiscountEnum.MANUAL}>Manual</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <span>discount</span>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <input
                className="drop-shadow-none rounded-r-none bg-custom-gray w-full"
                onChange={(e) =>
                  updateInvoiceDiscountByKey(
                    product.product.product_ID,
                    Number(e.target.value),
                    product.variant.variantName
                  )
                }
              />
              <select
                className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                value={discount}
                onChange={(e) => setDiscount(e.target.value as DiscountEnum)}
              >
                <option value={DiscountEnum.PERCENTAGE}>Percentage (%)</option>
                <option value={DiscountEnum.MANUAL}>Manual</option>
              </select>
            </div>
          </div>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex gap-2 items-center">
          <span>total:</span>
          <input
            className="shadow-none drop-shadow-none bg-custom-gray w-full"
            value={calculateTotal().toString()}
          />
        </div>
      </div>
    </div>
  );
};

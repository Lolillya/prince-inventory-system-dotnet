import { Separator } from "@/components/separator";
import {
  useSelectedInvoiceProduct,
  useSelectedProductInvoiceQuery,
} from "@/features/invoice/selected-product";
import { handleError } from "@/helpers/error-handler.helper";
import { ChevronDownIcon, PlusIcon, XIcon } from "@/icons";
import { use, useState } from "react";

type Product = {
  brand: Brand;
  brand_ID: number;
  category: Category;
  category_ID: number;
  createdAt: string;
  description: string;
  product_Code: string;
  product_ID: number;
  product_Name: string;
  updatedAt: string;
  variant: Variant;
  variant_ID: number;
};

type Brand = {
  brandName: string;
  brand_ID: number;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  categoryName: string;
  category_ID: number;
  createdAt: string;
  updatedAt: string;
};

type Variant = {
  createdAt: string;
  updatedAt: string;
  productId: number;
  variant_ID: number;
  variant_Name: string;
};

type Batches = {
  baseUnit: BaseUnit;
  batch_ID: number;
  batch_Number: number;
  restock: Restock;
  supplier: Supplier;
  unitConversions: UnitConversion[];
  createdAt: string;
  updatedAt: string;
};

type BaseUnit = {
  unit_Price: number;
  unit_Quantity: number;
  uoM_ID: number;
  uoM_Name: string;
};

type Restock = {
  restock_ID: number;
  restock_Number: string;
  createdAt: string;
  updatedAt: string;
};

type Supplier = {
  companyName: string;
  email: string;
  firstName: string;
  lastName: string;
  supplpier_ID: number;
};

type UnitConversion = {
  conversion_Factor: number;
  parent_UOM_ID: number;
  parent_UOM_Name: string;
  product_UOM_Id: number;
  unit_Price: number;
  uoM_ID: number;
  uoM_Name: string;
};

interface Batch {
  baseUnit: BaseUnit;
  unitConversions: UnitConversion[];
}
interface InvoiceCardProp {
  onClick?: () => void;
  product: Product;
  batches: Batches[];
  // onRemove?: () => void;
}

enum DiscountEnum {
  MANUAL = "",
  PERCENTAGE = "%",
}

export const InvoiceCard = ({ product, batches }: InvoiceCardProp) => {
  const {
    updateInvoiceQuantityByKey,
    UPDATE_INVOICE_UNIT_PRICE,
    // UPDATE_INVOICE_UNIT,
    updateInvoiceDiscountByKey,
  } = useSelectedInvoiceProduct();

  const [discount, setDiscount] = useState<DiscountEnum>(DiscountEnum.MANUAL);
  const [isBaseUnitSelected, setIsBaseUnitSelected] = useState<boolean>(true);
  const [selectedUnit, setSelectedUnit] = useState<BaseUnit>();
  const [selectedBatch, setSelectedBatch] = useState<Batches>();
  const [isSupplierPriceSelected, setIsSupplierPriceSelected] =
    useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);

  const handleSelectBatch = (batch: Batches) => {
    setSelectedUnit(batch.baseUnit);
    setSelectedBatch(batch);
    console.log(batch);
  };

  console.log(isBaseUnitSelected);
  const handleChangeUnit = (unitName: string) => {
    if (!selectedBatch) return;

    setIsBaseUnitSelected(selectedBatch.baseUnit.uoM_Name === unitName);

    // Check if it's the base unit
    if (selectedBatch.baseUnit.uoM_Name === unitName) {
      setSelectedUnit(selectedBatch.baseUnit);
      return;
    }

    // Otherwise, look in unit conversions
    const found = selectedBatch.unitConversions.find(
      (u) => u.uoM_Name === unitName
    );
    if (found) {
      setSelectedUnit({
        unit_Price: found.unit_Price,
        unit_Quantity: 0,
        uoM_ID: found.uoM_ID,
        uoM_Name: found.uoM_Name,
      });
    }
  };

  function calculateAvailableStock(
    batch: Batch,
    selectedUomId: number
  ): number {
    let total: number = batch.baseUnit.unit_Quantity;
    let currentUomId: number = batch.baseUnit.uoM_ID;

    // If base unit is selected
    if (currentUomId === selectedUomId) {
      return total;
    }

    // Prevent infinite loops / circular conversions
    const visited: Set<number> = new Set();

    while (currentUomId !== selectedUomId) {
      if (visited.has(currentUomId)) {
        throw new Error("Circular unit conversion detected");
      }
      visited.add(currentUomId);

      const conversion = batch.unitConversions.find(
        (c: UnitConversion) => c.parent_UOM_ID === currentUomId
      );

      if (!conversion) {
        throw new Error("No conversion path found to selected unit");
      }

      total *= conversion.conversion_Factor;
      currentUomId = conversion.uoM_ID;
    }

    return total;
  }

  const handleChangePrice = () => {};

  return (
    <div className="p-5 border shadow-lg rounded-lg h-fit w-full max-w-120 text-xs">
      <div className="flex gap-2 items-center text-xs justify-between">
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 bg-orange-300 rounded-full" />
          <span>{product.product_Name}</span>
          <span>{product.brand.brandName}</span>
          <span>{product.variant.variant_Name}</span>
        </div>
        <div
          // onClick={onRemove}
          className="cursor-pointer hover:bg-gray-200 rounded p-1"
        >
          <XIcon />
        </div>
      </div>

      <div className="bg-custom-bg-white pr-2 w-full rounded-lg flex items-center justify-between">
        {/* <span>Add Batch</span> */}

        <div className="flex gap-2 items-center max-w-fit overflow-x-scroll p-2">
          {/* Map through batches */}
          {batches.map((b, i) => (
            <div
              className="p-2 bg-card rounded-md shadow-md border text-nowrap cursor-pointer"
              onClick={() => handleSelectBatch(b)}
              key={i}
            >
              <span>Batch {b.batch_Number}</span>
            </div>
          ))}
        </div>
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
              <div className="flex w-full relative items-center">
                <label className="absolute font-semibold text-xs ml-30 text-gray-400">
                  Available:{" "}
                  {selectedBatch && selectedUnit?.uoM_ID !== undefined
                    ? calculateAvailableStock(
                        selectedBatch,
                        selectedUnit.uoM_ID
                      )
                    : 0}
                </label>
                <input
                  className="drop-shadow-none rounded-r-none bg-custom-gray w-full"
                  onChange={(e) =>
                    updateInvoiceQuantityByKey(
                      product.product_ID,
                      Number(e.target.value),
                      product.variant.variant_Name
                    )
                  }
                />
              </div>
              <select
                className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                value={selectedUnit?.uoM_Name || ""}
                onChange={(e) => handleChangeUnit(e.target.value)}
              >
                {selectedBatch?.baseUnit && (
                  <option
                    key={"base-unit"}
                    value={selectedBatch.baseUnit.uoM_Name}
                  >
                    {selectedBatch.baseUnit.uoM_Name}
                  </option>
                )}
                {selectedBatch?.unitConversions.map((u, i) => (
                  <option key={i} value={u.uoM_Name}>
                    {u.uoM_Name}
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
                className="drop-shadow-none rounded-r-none  bg-custom-gray w-full"
                disabled={isSupplierPriceSelected}
                value={isSupplierPriceSelected ? (selectedUnit?.unit_Price || "0") : price}
                onChange={(e) => {
                  const newPrice = Number(e.target.value);
                  setPrice(newPrice);
                  UPDATE_INVOICE_UNIT_PRICE(
                    product.product_ID,
                    newPrice,
                    product.variant.variant_Name
                  );
                }}
              />
              <select
                className="drop-shadow-none rounded-l-none border-l-gray border-l bg-custom-gray w-full rounded-r-lg pl-6"
                value={isSupplierPriceSelected ? "supplier" : "manual"}
                onChange={(e) => {
                  const isSupplier = e.target.value === "supplier";
                  setIsSupplierPriceSelected(isSupplier);
                  if (isSupplier && selectedUnit) {
                    UPDATE_INVOICE_UNIT_PRICE(
                      product.product_ID,
                      selectedUnit.unit_Price,
                      product.variant.variant_Name
                    );
                  }
                }}
              >
                <option value="supplier">Supplier Price</option>
                <option value="manual">Manual</option>
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
                    product.product_ID,
                    Number(e.target.value),
                    product.variant.variant_Name
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
            // value={calculateTotal().toString()}
          />
        </div>
      </div>
    </div>
  );
};

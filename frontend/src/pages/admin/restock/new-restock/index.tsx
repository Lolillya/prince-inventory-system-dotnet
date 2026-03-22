import { NoSelectedState } from "@/components/no-selected-state";
import { LeftArrowIcon, SearchIcon } from "@/icons";
import { Activity, useState } from "react";
import { CreateRestockModal } from "./_components/restock-modal";
import { ProductCard } from "../_components/product-card";
import { RestockCard2 } from "./_components/restock-card-copy";
import {
  useUnitPresetRestockItems,
  useUnitPresetRestock,
} from "@/features/restock/unit-preset-restock.query";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";

const NewRestockPage = () => {
  // GLOBAL STATES
  const { data: inventoryData, isLoading, error } = UseInventoryQuery();
  const { data: items = [] } = useUnitPresetRestockItems();
  const { addProduct, removeProduct } = useUnitPresetRestock();

  // LOCAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  // console.log(inventoryData);

  const createRestock = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleClick = (data: InventoryProductModel) => {
    const restockItem: InventoryProductModel = {
      product: {
        product_ID: data.product.product_ID,
        product_Code: data.product.product_Code,
        product_Name: data.product.product_Name,
        description: data.product.description,
        // brandId: data.brand.brand_ID,
        // categoryID: data.category.category_ID,
        createdAt: data.product.createdAt,
        updatedAt: data.product.updatedAt,
        quantity: data.product.quantity,
      },
      variant: {
        variant_ID: data.variant.variant_ID,
        variant_Name: data.variant.variant_Name,
        createdAt: data.variant.createdAt,
        updatedAt: data.variant.updatedAt,
      },
      brand: {
        brand_ID: data.brand.brand_ID,
        brandName: data.brand.brandName,
        createdAt: data.brand.createdAt,
        updatedAt: data.brand.updatedAt,
      },
      category: data.category,
      unitPresets: (data.unitPresets as any) || [],
      isComplete: data.isComplete,
      isFavorited: data.isFavorited,
      isSetupComplete: data.isSetupComplete,
      restockInfo: data.restockInfo,
    };
    addProduct(restockItem);
  };

  const handleRemoveProduct = (itemId: string) => {
    removeProduct(itemId);
  };

  // Calculate if all items are ready for restock
  const readyItemsCount = items.filter((item) => {
    const typedItem = item as any;
    return (
      typedItem.selectedPreset &&
      typedItem.selectedPreset.main_Unit_Quantity > 0
    );
  }).length;

  const allItemsReady = items.length > 0 && readyItemsCount === items.length;

  return (
    <>
      <Activity mode={isModalOpen ? "visible" : "hidden"}>
        <CreateRestockModal createRestock={createRestock} />
      </Activity>
      <section className="relative">
        <div className="flex flex-col min-h-0 flex-1 gap-5">
          <div className="flex flex-col gap-10">
            <div className="flex gap-3 border-b pb-5 items-center">
              <LeftArrowIcon />
              <span>new restock</span>
              <span>#123456</span>
            </div>
          </div>

          <div className="flex flex-col gap-10 overflow-y-hidden flex-1">
            <div className="flex gap-5 overflow-y-hidden flex-1">
              {/* LEFT */}
              <div className="w-full flex relative">
                {items.length === 0 ? (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border-border border shadow-sm px-4 py-2 bg-white">
                    <label className="text-sm font-medium">
                      No items added
                    </label>
                  </div>
                ) : (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border-border border shadow-sm px-4 py-2 bg-white z-10">
                    <label className="text-sm font-medium">
                      {readyItemsCount}/{items.length} product
                      {items.length !== 1 ? "s" : ""} ready for restock
                    </label>
                  </div>
                )}
                {!items || items.length === 0 ? (
                  <NoSelectedState />
                ) : (
                  <div className="flex gap-2 flex-wrap h-full overflow-y-auto flex-1 pr-2">
                    {items.map((item, i) => {
                      // Get all selected presets for this product from other items
                      const selectedPresetIds = items
                        .filter(
                          (otherItem) =>
                            otherItem.product.product_ID ===
                              item.product.product_ID &&
                            (otherItem as any).itemId !== (item as any).itemId,
                        )
                        .map(
                          (otherItem) =>
                            (otherItem as any).selectedPreset?.preset_ID,
                        )
                        .filter((id): id is number => id !== undefined);

                      return (
                        <RestockCard2
                          key={(item as any).itemId || i}
                          product={item}
                          itemId={(item as any).itemId}
                          excludePresetIds={selectedPresetIds}
                          onRemove={() =>
                            handleRemoveProduct((item as any).itemId)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex flex-col w-2/5 gap-5">
                <div className="rounded-lg shadow-lg p-5 border h-full overflow-y-hidden flex-1 flex flex-col gap-5">
                  <div className="flex flex-col gap-1">
                    <div className="relative w-full">
                      <input
                        placeholder="Search..."
                        className="input-style-2"
                      />
                      <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                      </i>
                    </div>
                  </div>

                  <div className="pr-2 flex flex-col gap-5 overflow-y-scroll flex-1 h-full">
                    {inventoryData?.map((data, i) => (
                      <ProductCard
                        product={data}
                        onClick={() => handleClick(data)}
                        key={i}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-5 justify-between">
                  <button>clear</button>
                  <button
                    onClick={createRestock}
                    disabled={!allItemsReady}
                    className={`px-4 py-2 rounded ${
                      allItemsReady
                        ? "text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    confirm restock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewRestockPage;

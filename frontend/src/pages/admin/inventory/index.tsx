import { NoSelectedState } from "@/components/no-selected-state";
import { Separator } from "@/components/separator";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import {
  useSelectedProductQuery,
  useSetSelectedProduct,
} from "@/features/inventory/product-selected";
import {
  EditIcon,
  EllipsisIcon,
  FileDownIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import { SelectedProduct } from "./_components/selected-product";
import { Activity, useState } from "react";
import { AddProductModal } from "./add-product/_components/AddProductModal";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { EditProductModal } from "./_components/edit-product.modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductUnitPresetModal } from "./_components/preset-editor.modal";
import { PresetSelectorModal } from "./_components/preset-selector.modal";

const InventoryPage = () => {
  const { data: inventory, isLoading, error } = UseInventoryQuery();
  const { data: selectedProduct } = useSelectedProductQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isPresetEditorOpen, setIsPresetEditorOpen] = useState(false);
  const [isPresetSelectorOpen, setIsPresetSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const setSelectedProduct = useSetSelectedProduct();

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handlePresetEditor = () => {
    setIsPresetEditorOpen(!isPresetEditorOpen);
    setIsModalOpen(false);
    setIsEditProductModalOpen(false);
  };

  const handleClick = (product: InventoryProductModel) => {
    setSelectedProduct(product);
  };

  const handleEditProduct = () => {
    setIsEditProductModalOpen(!isEditProductModalOpen);
    setIsModalOpen(false);
    setIsPresetEditorOpen(false);
  };

  const handlePresetSelector = () => {
    setIsPresetSelectorOpen(!isPresetSelectorOpen);
  };

  // Filter inventory based on search query
  const filteredInventory = inventory?.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.product.product_Code.toLowerCase().includes(query) ||
      item.product.product_Name.toLowerCase().includes(query) ||
      item.brand.brandName.toLowerCase().includes(query) ||
      item.variant.variant_Name.toLowerCase().includes(query) ||
      item.category.category_Name.toLowerCase().includes(query)
    );
  });

  // Check if product requires setup (incomplete or missing stock levels)
  const requiresSetup = (product: InventoryProductModel) => {
    if (!product.isComplete) return true;

    // Check if any unitPreset has null stock levels
    return product.unitPresets.some(
      (preset) =>
        preset.low_Stock_Level === null ||
        preset.low_Stock_Level === undefined ||
        preset.very_Low_Stock_Level === null ||
        preset.very_Low_Stock_Level === undefined
    );
  };

  console.log(filteredInventory);

  return (
    <section>
      {/* ADD PRODUCT MODAL */}
      <Activity mode={isModalOpen ? "visible" : "hidden"}>
        <AddProductModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </Activity>

      {/* PRESET EDITOR MODAL */}
      <Activity mode={isPresetEditorOpen ? "visible" : "hidden"}>
        <ProductUnitPresetModal handlePresetEditor={handlePresetEditor} />
      </Activity>

      {/* PRESET SELECTOR MODAL */}
      <Activity mode={isPresetSelectorOpen ? "visible" : "hidden"}>
        <PresetSelectorModal handlePresetSelector={handlePresetSelector} />
      </Activity>

      {isEditProductModalOpen && selectedProduct && (
        <EditProductModal
          setIsEditProductModalOpen={setIsEditProductModalOpen}
          selectedProduct={selectedProduct}
        />
      )}
      {/* HEADER */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 max-w-lg w-full shrink-0">
            <div className="relative w-full">
              <input
                placeholder="Search..."
                className="input-style-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            <div className="p-3 bg-custom-gray rounded-lg inset-shadow-sm border">
              <FilterIcon />
            </div>
          </div>

          <div className="flex w-full justify-end gap-2">
            <div className="bg-custom-gray p-3 rounded-lg inset-shadow-sm border">
              <FileDownIcon />
            </div>
            <button
              className="flex items-center justify-center gap-2"
              onClick={() => setIsModalOpen(!isModalOpen)}
            >
              new item
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex flex-1 gap-3 overflow-y-hidden">
        {/*  LEFT PANEL */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-custom-gray p-1 rounded-lg flex justify-between shadow-sm border">
            <div className=" gap-10 flex items-center pl-2">
              <label className="capitalize text-saltbox-gray font-semibold text-sm">
                inventory
              </label>

              <span className="text-xs text-vesper-gray font-semibold">
                {filteredInventory?.length} records
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs flex items-center gap-2 cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none">
                <EllipsisIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handlePresetEditor}
                  >
                    Packaging Presets
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="w-full overflow-y-scroll flex flex-col gap-2 p-2 inset-shadow-sm rounded-lg border">
            {filteredInventory?.map((data, index) => (
              <>
                <div
                  className={`flex justify-between p-2 rounded-lg transition-all duration-300 ${
                    requiresSetup(data)
                      ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30"
                      : "hover:bg-accent"
                  }`}
                  key={index}
                  onClick={() => handleClick(data)}
                >
                  <div className="flex gap-2 items-center">
                    {requiresSetup(data) && (
                      <span className="text-xs bg-saltbox-gray text-white px-2 py-0.5 rounded-full font-medium">
                        Setup Required
                      </span>
                    )}
                    <span className="capitalize">
                      {data.product.product_Code}
                    </span>
                    <span className="capitalize">{data.brand.brandName}</span>
                    <span className="capitalize">
                      {data.variant.variant_Name}
                    </span>
                  </div>
                  <div
                    onClick={handleEditProduct}
                    className="cursor-pointer hover:bg-accent p-2 rounded-lg duration-300 transition-all"
                  >
                    <EditIcon />
                  </div>
                </div>
                <Separator />
              </>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[70%] flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center shadow-sm border">
            <label className="capitalize text-saltbox-gray font-semibold text-base">
              details
            </label>
          </div>

          <div className="h-full bg-custom-gray rounded-lg flex p-5 shadow-lg border">
            {!selectedProduct ? (
              <NoSelectedState />
            ) : (
              <SelectedProduct
                product={selectedProduct}
                handlePresetSelector={handlePresetSelector}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPage;

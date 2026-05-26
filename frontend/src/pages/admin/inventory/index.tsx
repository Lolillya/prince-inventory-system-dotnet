import { NoSelectedState } from "@/components/no-selected-state";
import { Separator } from "@/components/separator";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import {
  useSelectedProductQuery,
  useSetSelectedProduct,
} from "@/features/inventory/product-selected";
import {
  EditIcon,
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
import { ProductUnitPresetModal } from "./_components/preset-editor.modal";
import { PresetSelectorModal } from "./_components/preset-selector.modal";
import { ProductPackagingModal } from "./_components/product-packaging.modal";
import { QuotationGeneratorModal } from "./_components/quotation-generator.modal";
import {
  Archive,
  Check,
  List,
  ListCollapse,
  ListOrdered,
  PackageOpen,
  ReceiptText,
  Star,
} from "lucide-react";
import {
  AddProductAsFavoriteService,
  RemoveProductFromFavoritesService,
} from "@/features/inventory/favorites/add-product-as-favorite.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportMasterlistPdf,
  exportPricelistPdf,
  exportStocklistPdf,
} from "./services/pdf-export.service";

const InventoryPage = () => {
  const {
    data: inventory,
    isLoading,
    error,
    refetch: refetchInventory,
  } = UseInventoryQuery();
  const { data: selectedProduct } = useSelectedProductQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isPresetEditorOpen, setIsPresetEditorOpen] = useState(false);
  const [isPresetSelectorOpen, setIsPresetSelectorOpen] = useState(false);
  const [isProductPackagingOpen, setIsProductPackagingOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isFromEditModal, setIsFromEditModal] = useState(false);
  const [stocklistFilters, setStocklistFilters] = useState<Set<string>>(
    new Set(["sufficient-stock", "low-stock", "very-low-stock", "no-stock"]),
  );

  const toggleStocklistFilter = (key: string) => {
    setStocklistFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const setSelectedProduct = useSetSelectedProduct();

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handlePresetEditor = async () => {
    if (isPresetEditorOpen && isFromEditModal) {
      // Closing preset editor from edit modal flow - reopen edit modal and refresh data
      const { data: freshData } = await refetchInventory();

      // Update the selected product with fresh data
      if (selectedProduct && freshData) {
        const updatedProduct = freshData.find(
          (item) =>
            item.product.product_ID === selectedProduct.product.product_ID,
        );
        if (updatedProduct) {
          setSelectedProduct(updatedProduct);
        }
      }

      setIsPresetEditorOpen(false);
      setIsEditProductModalOpen(true);
      setIsFromEditModal(false);
    } else {
      // Normal toggle behavior
      setIsPresetEditorOpen(!isPresetEditorOpen);
      setIsModalOpen(false);
      setIsEditProductModalOpen(false);
      setIsFromEditModal(false);
    }
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

  const handleAddPackagingPreset = () => {
    setIsFromEditModal(true);
    setIsPresetEditorOpen(true);
    setIsEditProductModalOpen(false);
  };

  const handleSetAsFavorite = async (
    e: React.MouseEvent,
    productId: number,
    isFavorited: boolean,
  ) => {
    e.stopPropagation(); // Prevent triggering the parent onClick

    try {
      if (isFavorited) {
        await RemoveProductFromFavoritesService(productId);
      } else {
        await AddProductAsFavoriteService(productId);
      }
      // Refetch inventory to update the UI
      await refetchInventory();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Filter inventory based on search query
  const filteredInventory = inventory
    ?.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.product.product_Code.toLowerCase().includes(query) ||
        item.product.product_Name.toLowerCase().includes(query) ||
        item.brand.brandName.toLowerCase().includes(query) ||
        item.variant.variant_Name.toLowerCase().includes(query) ||
        item.category.category_Name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Deactivated products always sink to the bottom
      const activeDiff =
        Number(b.product.is_Active) - Number(a.product.is_Active);
      if (activeDiff !== 0) return activeDiff;
      // Within active group: favorites first
      const favDiff = Number(b.isFavorited) - Number(a.isFavorited);
      if (favDiff !== 0) return favDiff;
      return a.product.product_ID - b.product.product_ID;
    });

  const getIncompletePresetCount = (product: InventoryProductModel) => {
    return product.unitPresets.filter(
      (preset) =>
        preset.low_Stock_Level == null || preset.very_Low_Stock_Level == null,
    ).length;
  };

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
        <ProductPackagingModal
          onClose={() => setIsProductPackagingOpen(false)}
        />
        {/* <PresetSelectorModal handlePresetSelector={handlePresetSelector} /> */}
      </Activity>

      <Activity mode={isProductPackagingOpen ? "visible" : "hidden"}>
        <ProductPackagingModal
          onClose={() => setIsProductPackagingOpen(false)}
        />
      </Activity>

      {isEditProductModalOpen && selectedProduct && (
        <EditProductModal
          setIsEditProductModalOpen={setIsEditProductModalOpen}
          selectedProduct={selectedProduct}
          handleAddPackagingPreset={handleAddPackagingPreset}
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
                autoComplete="new-password"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="bg-custom-gray p-3 rounded-lg inset-shadow-sm border cursor-pointer">
                  <FileDownIcon />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <List size={16} />
                    Export Masterlist
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-64">
                    <DropdownMenuItem
                      onClick={() => exportMasterlistPdf(inventory ?? [], true)}
                    >
                      Include Packaging Hierarchy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        exportMasterlistPdf(inventory ?? [], false)
                      }
                    >
                      Exclude Packaging Hierarchy
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <ListOrdered size={16} />
                    Export Pricelist
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-64">
                    <DropdownMenuItem
                      onClick={() => exportPricelistPdf(inventory ?? [], true)}
                    >
                      Include Packaging Hierarchy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => exportPricelistPdf(inventory ?? [], false)}
                    >
                      Exclude Packaging Hierarchy
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <ListCollapse size={16} />
                    Export Stocklist
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-72 p-0">
                    <DropdownMenuItem
                      className="gap-2 py-2.5"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleStocklistFilter("sufficient-stock");
                      }}
                    >
                      <Check
                        size={16}
                        className={
                          stocklistFilters.has("sufficient-stock")
                            ? "text-slate-700"
                            : "text-transparent"
                        }
                      />
                      <span className="h-4 w-4 rounded-full bg-[#8fd19e]" />
                      Sufficient stock
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 py-2.5"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleStocklistFilter("low-stock");
                      }}
                    >
                      <Check
                        size={16}
                        className={
                          stocklistFilters.has("low-stock")
                            ? "text-slate-700"
                            : "text-transparent"
                        }
                      />
                      <span className="h-4 w-4 rounded-full bg-[#f0db96]" />
                      Low stock
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 py-2.5"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleStocklistFilter("very-low-stock");
                      }}
                    >
                      <Check
                        size={16}
                        className={
                          stocklistFilters.has("very-low-stock")
                            ? "text-slate-700"
                            : "text-transparent"
                        }
                      />
                      <span className="h-4 w-4 rounded-full bg-[#f28e8e]" />
                      Very low stock
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 py-2.5"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleStocklistFilter("no-stock");
                      }}
                    >
                      <Check
                        size={16}
                        className={
                          stocklistFilters.has("no-stock")
                            ? "text-slate-700"
                            : "text-transparent"
                        }
                      />
                      <span className="h-4 w-4 rounded-full bg-[#d5dae3]" />
                      No stock
                    </DropdownMenuItem>
                    <Separator />
                    {/* <DropdownMenuItem
                      className="gap-2 py-2.5"
                      onClick={() =>
                        exportStocklistPdf(
                          inventory ?? [],
                          stocklistFilters,
                          true,
                        )
                      }
                      disabled={stocklistFilters.size === 0}
                    >
                      Export Stocklist
                    </DropdownMenuItem> */}

                    <DropdownMenuItem
                      onClick={() =>
                        exportStocklistPdf(
                          inventory ?? [],
                          stocklistFilters,
                          true,
                        )
                      }
                      disabled={stocklistFilters.size === 0}
                    >
                      Include Packaging Hierarchy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        exportStocklistPdf(
                          inventory ?? [],
                          stocklistFilters,
                          false,
                        )
                      }
                      disabled={stocklistFilters.size === 0}
                    >
                      Exclude Packaging Hierarchy
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => setIsQuotationModalOpen(true)}
                >
                  <ReceiptText size={16} />
                  Generate Quotation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          <div className="bg-custom-gray p-2 rounded-lg flex justify-between shadow-sm border items-center h-11">
            <div className=" gap-10 flex items-center pl-2">
              <label className="capitalize text-saltbox-gray font-normal text-sm">
                inventory
              </label>

              <span className="capitalize text-vesper-gray text-xs">
                {filteredInventory?.length} records
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <div
                className="flex gap-2 items-center rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none"
                onClick={() => setIsProductPackagingOpen(true)}
              >
                <Archive size={18} />
                <label className="cursor-pointer">Product Packaging</label>
              </div>

              <div
                className="flex gap-2 items-center rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none"
                onClick={handlePresetEditor}
              >
                <PackageOpen size={18} />
                <label className="cursor-pointer">Packaging Presets</label>
              </div>
            </div>
          </div>

          <div className="w-full overflow-y-scroll flex flex-col gap-2 p-2 inset-shadow-sm rounded-lg border">
            {filteredInventory?.map((data, index) => (
              <>
                <div
                  className={`flex justify-between ${
                    !data.product.is_Active
                      ? "opacity-60 bg-gray-100 dark:bg-gray-900/30"
                      : data.isFavorited
                        ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30"
                        : "hover:bg-accent"
                  } p-2 rounded-lg transition-all duration-300`}
                  key={index}
                  onClick={() => handleClick(data)}
                >
                  <div className="flex items-center w-full">
                    <div className="gap-2 flex items-center flex-nowrap text-nowrap">
                      <div className="flex flex-col gap-0.5">
                        {data.product.quantity === 0 ? (
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                        ) : (
                          <>
                            {data.unitPresets.some(
                              (u) =>
                                u.low_Stock_Level != null &&
                                data.product.quantity <= u.low_Stock_Level &&
                                (u.very_Low_Stock_Level == null ||
                                  data.product.quantity >
                                    u.very_Low_Stock_Level),
                            ) && (
                              <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            )}
                            {data.unitPresets.some(
                              (u) =>
                                u.very_Low_Stock_Level != null &&
                                data.product.quantity > 0 &&
                                data.product.quantity <= u.very_Low_Stock_Level,
                            ) && (
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                          </>
                        )}
                      </div>
                      <span className="capitalize">
                        {data.product.product_Name}
                      </span>
                    </div>
                    <div className="w-full items-center justify-end flex">
                      {!data.product.is_Active ? (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          Deactivated
                        </span>
                      ) : data.unitPresets.length === 0 ? (
                        <span className="text-xs bg-red-100 border border-red-500 text-red-500 px-2 py-0.5 rounded-full font-medium">
                          No Presets
                        </span>
                      ) : getIncompletePresetCount(data) > 0 ? (
                        <span className="text-xs bg-amber-100 border border-amber-500 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                          {getIncompletePresetCount(data)} preset incomplete
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ">
                    <div
                      onClick={(e) =>
                        handleSetAsFavorite(
                          e,
                          data.product.product_ID,
                          data.isFavorited,
                        )
                      }
                      className={`cursor-pointer hover:bg-amber-200 hover:text-amber-400 p-2 rounded-lg duration-300 transition-all ${data.isFavorited ? "text-yellow-400" : "text-gray-400"}`}
                    >
                      <Star
                        className={data.isFavorited ? "fill-yellow-400" : ""}
                      />
                    </div>
                    <div
                      onClick={handleEditProduct}
                      className="cursor-pointer hover:bg-accent p-2 rounded-lg duration-300 transition-all"
                    >
                      <EditIcon />
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[50%] flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center border shadow-sm h-11">
            <label className="capitalize text-saltbox-gray font-normal text-sm">
              details
            </label>
          </div>

          <div className="flex h-full min-h-0 rounded-lg border shadow-sm: bg-custom-gray">
            {!selectedProduct ? (
              <NoSelectedState />
            ) : (
              <SelectedProduct
                product={selectedProduct}
                handlePresetSelector={() => setIsProductPackagingOpen(true)}
              />
            )}
          </div>
        </div>
      </div>
      <QuotationGeneratorModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        inventory={inventory ?? []}
      />
    </section>
  );
};

export default InventoryPage;

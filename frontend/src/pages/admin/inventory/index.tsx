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
import {
  Archive,
  List,
  ListCollapse,
  ListOrdered,
  PackageOpen,
  ReceiptText,
  Star,
} from "lucide-react";
import jsPDF from "jspdf";
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
  const [isFromEditModal, setIsFromEditModal] = useState(false);
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

  console.log(inventory);

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
    .sort((a, b) => Number(b.isFavorited) - Number(a.isFavorited));

  // Check if product requires setup (incomplete or missing stock levels)
  const requiresSetup = (product: InventoryProductModel) => {
    if (!product.isComplete) return true;

    // Check if any unitPreset has null stock levels
    return product.unitPresets.some(
      (preset) =>
        preset.low_Stock_Level === null ||
        preset.low_Stock_Level === undefined ||
        preset.very_Low_Stock_Level === null ||
        preset.very_Low_Stock_Level === undefined,
    );
  };

  const buildProductDescription = (item: InventoryProductModel) => {
    return `${item.product.product_Name}-${item.brand.brandName}-${item.variant.variant_Name}`;
  };

  const exportMasterlistPdf = (
    includePackagingHierarchy: boolean,
    includeNoStock: boolean,
  ) => {
    if (!inventory || inventory.length === 0) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const xCode = 15;
    const xDescription = 65;
    const xUom = 160;
    const contentBottom = pageHeight - 12;

    let y = 18;

    const drawHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Inventory Masterlist", xCode, y);

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Product Code", xCode, y);
      doc.text("Description", xDescription, y);
      doc.text("UOM", xUom, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
    };

    const ensureSpace = (neededHeight: number) => {
      if (y + neededHeight > contentBottom) {
        doc.addPage();
        y = 18;
        drawHeader();
      }
    };

    drawHeader();

    const source = inventory.filter((item) => {
      if (includeNoStock) return true;
      return item.product.quantity > 0;
    });

    source.forEach((item) => {
      const sortedLevels = [...(item.unitPresets[0]?.preset.presetLevels ?? [])].sort(
        (a, b) => a.level - b.level,
      );

      const primaryUom = sortedLevels[0]?.unitOfMeasure.uom_Name ?? "-";

      const codeLines = doc.splitTextToSize(item.product.product_Code, 45);
      const descLines = doc.splitTextToSize(buildProductDescription(item), 85);
      const maxLines = Math.max(codeLines.length, descLines.length);
      const blockHeight = (maxLines * 5) + 2;

      ensureSpace(blockHeight);
      doc.text(codeLines, xCode, y);
      doc.text(descLines, xDescription, y);
      doc.text(primaryUom, xUom, y);
      y += blockHeight;

      if (includePackagingHierarchy && sortedLevels.length > 1) {
        sortedLevels.slice(1).forEach((level) => {
          ensureSpace(5);
          doc.text(
            `└─ ${level.unitOfMeasure.uom_Name} (x${level.conversion_Factor})`,
            xUom,
            y,
          );
          y += 5;
        });
      }

      y += 2;
    });

    const hierarchySuffix = includePackagingHierarchy
      ? "with-packaging-hierarchy"
      : "without-packaging-hierarchy";
    const stockSuffix = includeNoStock ? "include-no-stock" : "exclude-no-stock";

    doc.save(`inventory-masterlist-${hierarchySuffix}-${stockSuffix}.pdf`);
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
        <PresetSelectorModal handlePresetSelector={handlePresetSelector} />
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
                  <DropdownMenuSubContent className="w-56">
                    <DropdownMenuItem onClick={() => exportMasterlistPdf(true, true)}>
                      Include no stock
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportMasterlistPdf(true, false)}>
                      Exclude no stock
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem className="gap-2">
                  <ListOrdered size={16} />
                  Export Pricelist
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <ListCollapse size={16} />
                  Export Stocklist
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
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
          <div className="bg-custom-gray p-1 rounded-lg flex justify-between shadow-sm border">
            <div className=" gap-10 flex items-center pl-2">
              <label className="capitalize text-saltbox-gray font-semibold text-sm">
                inventory
              </label>

              <span className="text-xs text-vesper-gray font-semibold">
                {filteredInventory?.length} records
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <div
                className="flex gap-1 items-center rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none"
                onClick={() => setIsProductPackagingOpen(true)}
              >
                <Archive />
                <label className="cursor-pointer">Product Packaging</label>
              </div>

              <div
                className="flex gap-1 items-center rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none"
                onClick={handlePresetEditor}
              >
                <PackageOpen />
                <label className="cursor-pointer">Packaging Presets</label>
              </div>
            </div>
          </div>

          <div className="w-full overflow-y-scroll flex flex-col gap-2 p-2 inset-shadow-sm rounded-lg border">
            {filteredInventory?.map((data, index) => (
              <>
                <div
                  className={`flex justify-between ${data.isFavorited ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30" : "hover:bg-accent"} p-2 rounded-lg transition-all duration-300`}
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
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center shadow-sm border">
            <label className="capitalize text-saltbox-gray font-semibold text-sm">
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

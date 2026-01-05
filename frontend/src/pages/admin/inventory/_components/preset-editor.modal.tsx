import { PlusIcon } from "@/icons";
import { XIcon } from "lucide-react";
import { Activity, useState } from "react";
import { PresetEditorForm } from "./forms/preset-editor.form";
import { UseInventoryQuery } from "@/features/restock/inventory-batch";
import { ProductCard } from "@/components/product-card";

interface ProductUnitPresetModalProp {
  handlePresetEditor: () => void;
}

export const ProductUnitPresetModal = ({
  handlePresetEditor,
}: ProductUnitPresetModalProp) => {
  const [isAddPresetOpen, setIsAddPresetOpen] = useState(false);
  const [isAddProductsToPresetOpen, setIsAddProductsToPresetOpen] =
    useState(false);
  const { data: products } = UseInventoryQuery();

  const handleAddPreset = () => {
    setIsAddPresetOpen(!isAddPresetOpen);
  };

  const handleCloseModal = () => {
    setIsAddPresetOpen(false);
    handlePresetEditor();
  };

  const handleCancelAddPreset = () => {
    setIsAddPresetOpen(false);
  };

  const handleAddProductsToPreset = () => {
    setIsAddProductsToPresetOpen(!isAddProductsToPresetOpen);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      <div
        className={`w-3/6 ${isAddPresetOpen ? "h-4/12" : "h-4/5"} bg-white px-5 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4 transition-all duration-200`}
      >
        <div className="absolute top-4 right-4" onClick={handleCloseModal}>
          <XIcon />
        </div>

        <div className="w-full">
          <h1>Packaging Presets</h1>
        </div>

        <Activity mode={isAddPresetOpen ? "visible" : "hidden"}>
          <PresetEditorForm handleCancelAddPreset={handleCancelAddPreset} />
        </Activity>

        {!isAddPresetOpen && (
          <div className="flex flex-col gap-2 flex-1">
            {/* TABLE HEADER */}
            <div className="flex items-center justify-between p-2 border-b">
              <label className="text-sm font-semibold text-saltbox-gray">
                Main
              </label>
              <label className="text-sm font-semibold text-saltbox-gray">
                Conversion
              </label>
              <label className="text-sm font-semibold text-saltbox-gray">
                Used by
              </label>
              <label className="text-sm font-semibold text-saltbox-gray"></label>
            </div>

            {/* TABLE BODY */}

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between p-2 bg-custom-gray rounded-lg">
                <span className="text-sm font-semibold text-saltbox-gray">
                  Box
                </span>
                <span className="text-sm font-semibold text-saltbox-gray">
                  Box &gt; Cases &gt; Pieces
                </span>
                <span className="text-sm font-semibold text-saltbox-gray">
                  # Products
                </span>

                <span
                  className="text-sm font-semibold hover:underline cursor-pointer"
                  onClick={handleAddProductsToPreset}
                >
                  {isAddProductsToPresetOpen ? "Close" : "Add"}
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <button
                className="w-full max-w-full text-sm font-semibold"
                onClick={handleAddPreset}
              >
                Add Packaging Preset <PlusIcon />
              </button>
            </div>
          </div>
        )}
      </div>

      {/*   PRODUCT SELECTOR */}
      <Activity mode={isAddProductsToPresetOpen ? "visible" : "hidden"}>
        <div className="bg-white rounded-lg border shadow-lg py-10 px-5 flex flex-col gap-5 max-h-4/5 max-w-3/12 w-full">
          <div className="flex flex-col gap-5 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Select Product/s</h3>

              <label className="text-saltbox-gray text-sm">
                # products selected
              </label>
            </div>

            <div className="flex flex-col overflow-y-scroll gap-3 border p-3 rounded-lg inset-shadow-sm flex-1 min-h-0">
              {/* PRODUCT SELECTOR FORM */}
              {products?.map((data, index) => (
                <ProductCard product={data} key={index} />
              ))}
            </div>
          </div>

          <div className="flex w-full gap-3">
            <button className="w-full max-w-full">Add Product</button>
            <button className="w-full max-w-full">Cancel</button>
          </div>
        </div>
      </Activity>
    </div>
  );
};

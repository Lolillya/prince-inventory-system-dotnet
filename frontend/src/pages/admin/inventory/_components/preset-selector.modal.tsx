import { XIcon } from "@/icons";
import { useUnitPresetQuery } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.state";
import { useSelectedProductQuery } from "@/features/inventory/product-selected";
import { assignProductsToPreset } from "@/features/unit-of-measure/assign-product-to-preset/assign-product.service";
import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface PresetSelectorModalProps {
  handlePresetSelector: () => void;
}

export const PresetSelectorModal = ({
  handlePresetSelector,
}: PresetSelectorModalProps) => {
  const { data: presets, isLoading } = useUnitPresetQuery();
  const { data: selectedProduct } = useSelectedProductQuery();
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleAssign = async () => {
    if (!selectedPresetId || !selectedProduct) return;

    setIsSubmitting(true);
    try {
      await assignProductsToPreset({
        preset_ID: selectedPresetId,
        product_IDs: [selectedProduct.product.product_ID],
      });

      // Refetch inventory to update the UI
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });

      alert("Preset assigned successfully!");
      handlePresetSelector();
    } catch (error) {
      console.error("Error assigning preset:", error);
      alert("Failed to assign preset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if product already has this preset
  const isPresetAssigned = (presetId: number) => {
    return selectedProduct?.unitPresets.some((up) => up.preset_ID === presetId);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div
            className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={handlePresetSelector}
          >
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Select Unit Preset</h1>
            <p className="text-gray-500">
              Select a unit preset to associate to{" "}
              <span className="font-semibold">
                {selectedProduct?.product.product_Name}
              </span>
            </p>
          </div>
        </div>

        {/* Preset List */}
        <div className="flex flex-col gap-3 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading presets...</p>
            </div>
          ) : presets && presets.length > 0 ? (
            presets.map((preset) => {
              const isSelected = selectedPresetId === preset.preset_ID;
              const isAssigned = isPresetAssigned(preset.preset_ID);

              return (
                <div
                  key={preset.preset_ID}
                  onClick={() => setSelectedPresetId(preset.preset_ID)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {preset.preset_Name}
                        </h3>
                        {isAssigned && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <CheckIcon size={12} /> Already assigned
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        {preset.levels.map((level, idx) => (
                          <span
                            key={level.level_ID}
                            className="flex items-center gap-2"
                          >
                            <span className="font-medium">
                              {level.uoM_Name}
                            </span>
                            {idx < preset.levels.length - 1 && (
                              <span className="text-gray-400">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {preset.product_Count} product(s) using this preset
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <CheckIcon size={14} className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No presets available</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handlePresetSelector}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedPresetId || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Assigning..." : "Assign Preset"}
          </button>
        </div>
      </div>
    </div>
  );
};

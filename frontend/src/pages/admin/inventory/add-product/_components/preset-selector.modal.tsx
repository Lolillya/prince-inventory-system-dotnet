import { XIcon } from "lucide-react";
import { useUnitPresetQuery } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.state";
import { useState } from "react";

interface PresetSelectorModalProps {
  onClose: () => void;
  onSelectPresets: (presetIds: number[]) => void;
  alreadySelectedPresetIds: number[];
}

export const PresetSelectorModal = ({
  onClose,
  onSelectPresets,
  alreadySelectedPresetIds,
}: PresetSelectorModalProps) => {
  const { data: unitPresets } = useUnitPresetQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>(
    alreadySelectedPresetIds,
  );

  const handleTogglePreset = (presetId: number) => {
    setSelectedIds((prev) =>
      prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId],
    );
  };

  const handleConfirm = () => {
    onSelectPresets(selectedIds);
    onClose();
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg border shadow-lg py-10 px-5 flex flex-col gap-5 max-h-4/5 max-w-2xl w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Select Packaging Preset(s)</h2>
          <button type="button" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto flex-1 border p-3 rounded-lg">
          {unitPresets && unitPresets.length > 0 ? (
            unitPresets.map((preset) => {
              const isSelected = selectedIds.includes(preset.preset_ID);
              return (
                <div
                  key={preset.preset_ID}
                  onClick={() => handleTogglePreset(preset.preset_ID)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePreset(preset.preset_ID)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {preset.preset_Name}
                      </div>
                      <div className="flex gap-1 text-xs text-gray-600 mt-1">
                        {preset.levels.map((level, i) => (
                          <span key={i}>
                            {level.uoM_Name}
                            {i < preset.levels.length - 1 && (
                              <span className="mx-1">&gt;</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No packaging presets available.</p>
              <p className="text-sm mt-2">
                Create some presets first in the Inventory settings.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full"
            disabled={selectedIds.length === 0}
          >
            Confirm ({selectedIds.length} selected)
          </button>
          <button type="button" onClick={onClose} className="w-full">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

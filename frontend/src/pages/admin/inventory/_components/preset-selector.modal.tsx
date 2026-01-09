import { XIcon } from "@/icons";

interface PresetSelectorModalProps {
  handlePresetSelector: () => void;
}

export const PresetSelectorModal = ({
  handlePresetSelector,
}: PresetSelectorModalProps) => {
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div
            className="absolute top-4 right-4"
            onClick={handlePresetSelector}
          >
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Select Unit Preset</h1>
            <p className="text-gray-500">
              Select a unit preset to associate to this product.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

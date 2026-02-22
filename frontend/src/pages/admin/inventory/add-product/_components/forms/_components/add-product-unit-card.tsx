import { UseFormRegister, FieldErrors } from "react-hook-form";
import { UnitPresetLevel } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.model";

interface AddProductUnitCardProps {
  preset: UnitPresetLevel;
  register: UseFormRegister<any>;
  index: number;
  errors: FieldErrors;
  onRemove: (presetId: number) => void;
}

export const AddProductUnitCard = ({
  preset,
  register,
  index,
  errors,
  onRemove,
}: AddProductUnitCardProps) => {
  return (
    <div className="p-2 rounded-lg shadow-sm border flex items-center gap-3">
      <div className="flex gap-1 w-[30%]">
        {preset.levels.map((l, i) => (
          <span key={i} className="text-sm">
            {l.uoM_Name}
            {i < preset.levels.length - 1 && <span className="mx-1">&gt;</span>}
          </span>
        ))}
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="flex flex-col">
          <div className="bg-bellflower-gray rounded-lg flex items-center px-3 gap-2 w-40">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-300 shrink-0"></div>

            <input
              type="number"
              className="w-full bg-bellflower-gray shadow-none drop-shadow-none text-xs font-semibold placeholder:font-semibold text-saltbox-gray"
              placeholder="Low Stock"
              {...register(`unitPresets.${index}.low_Stock_Level`)}
            />
          </div>
          {(errors.unitPresets as any)?.[index]?.low_Stock_Level && (
            <span className="text-red-500 text-xs mt-1">
              {(errors.unitPresets as any)[index].low_Stock_Level?.message}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <div className="bg-bellflower-gray rounded-lg flex items-center px-3 gap-2 w-40">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300 shrink-0"></div>

            <input
              type="number"
              className="w-full bg-bellflower-gray shadow-none drop-shadow-none text-xs font-semibold placeholder:font-semibold text-saltbox-gray"
              placeholder="Very Low Stock"
              {...register(`unitPresets.${index}.very_Low_Stock_Level`)}
            />
          </div>
          {(errors.unitPresets as any)?.[index]?.very_Low_Stock_Level && (
            <span className="text-red-500 text-xs mt-1">
              {(errors.unitPresets as any)[index].very_Low_Stock_Level?.message}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(preset.preset_ID)}
          className="ml-auto text-red-500 hover:text-red-700 text-xs font-semibold"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

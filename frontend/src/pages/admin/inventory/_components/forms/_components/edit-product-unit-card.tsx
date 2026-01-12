import { UseFormRegister, FieldErrors } from "react-hook-form";

interface EditProductUnitCardProps {
  selectedProduct: {
    assigned_At: string;
    preset: {
      created_At: string;
      main_Unit_ID: number;
      presetLevels: Array<{
        conversion_Factor: number;
        created_At: string;
        level: number;
        level_ID: number;
        unitOfMeasure: {
          uom_ID: number;
          uom_Name: string;
        };
      }>;

      preset_ID: number;
      preset_Name: string;
      updated_At: string;
    };
    preset_ID: number;
    product_Preset_ID: number;
    low_Stock_Level?: number;
    very_Low_Stock_Level?: number;
  };
  register: UseFormRegister<any>;
  index: number;
  errors: FieldErrors;
}

export const EditProductUnitCard = ({
  selectedProduct,
  register,
  index,
  errors,
}: EditProductUnitCardProps) => {
  return (
    <div className="p-2 rounded-lg shadow-sm border flex items-center">
      <div className="flex gap-1 w-[30%]">
        {selectedProduct.preset.presetLevels.map((l, i) => (
          <>
            <span>{l.unitOfMeasure.uom_Name}</span>
            {i < selectedProduct.preset.presetLevels.length - 1 && (
              <span> &gt; </span>
            )}
          </>
        ))}
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="flex flex-col">
          <div className="bg-bellflower-gray rounded-lg flex items-center px-3 gap-2 w-40">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-300 shrink-0"></div>

            <input
              type="number"
              className="w-full bg-bellflower-gray shadow-none drop-shadow-none text-xs font-semibold placeholder:font-semibold text-saltbox-gray "
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
              className="w-full bg-bellflower-gray shadow-none drop-shadow-none text-xs font-semibold placeholder:font-semibold text-saltbox-gray "
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
      </div>
    </div>
  );
};

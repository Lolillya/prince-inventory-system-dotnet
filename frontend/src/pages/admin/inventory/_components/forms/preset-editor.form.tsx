import { Separator } from "@/components/separator";
import { useUnitOfMeasureQuery } from "@/features/unit-of-measure/unit-of-measure";
import { createUnitPreset } from "@/features/unit-of-measure/create-unit-preset/create-unit-preset.service";
import { CreateUnitPresetPayload } from "@/features/unit-of-measure/create-unit-preset/create-unit-preset.model";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { useState } from "react";

interface PresetEditorFormProps {
  handleCancelAddPreset: () => void;
}

const schema = yup.object().shape({
  presetName: yup.string().required("Preset Name is required"),
  baseUnit: yup.string().required("Base Unit is required"),
  conversion1: yup.string().required("Conversion 1 is required"),
  conversion1Qty: yup.string().required("Conversion 1 Quantity is required"),
  conversion2: yup.string(),
  conversion2Qty: yup.string(),
  conversion3: yup.string(),
  conversion3Qty: yup.string(),
  conversion4: yup.string(),
  conversion4Qty: yup.string(),
});

export const PresetEditorForm = ({
  handleCancelAddPreset,
}: PresetEditorFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data: units = [] } = useUnitOfMeasureQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch all unit selections
  const baseUnit = watch("baseUnit");
  const conversion1 = watch("conversion1");
  const conversion2 = watch("conversion2");
  const conversion3 = watch("conversion3");
  const conversion4 = watch("conversion4");

  // Helper function to filter available units for each dropdown
  const getAvailableUnits = (currentField?: string) => {
    const selectedUnits = [
      baseUnit,
      conversion1,
      conversion2,
      conversion3,
      conversion4,
    ].filter((unit) => unit && unit !== "None" && unit !== currentField);

    return units.filter((unit) => !selectedUnits.includes(String(unit.uom_ID)));
  };

  const handleSubmitForm = async (data: any) => {
    console.log("Form inputs:", data);

    setIsSubmitting(true);

    try {
      // Build the levels array
      const levels = [];
      let levelCounter = 1;

      // Base unit (level 1)
      levels.push({
        uom_ID: Number(data.baseUnit),
        level: levelCounter++,
        conversion_Factor: 1.0,
      });

      // Add conversions if they exist
      if (
        data.conversion1 &&
        data.conversion1 !== "None" &&
        data.conversion1Qty
      ) {
        levels.push({
          uom_ID: Number(data.conversion1),
          level: levelCounter++,
          conversion_Factor: Number(data.conversion1Qty),
        });
      }

      if (
        data.conversion2 &&
        data.conversion2 !== "None" &&
        data.conversion2Qty
      ) {
        levels.push({
          uom_ID: Number(data.conversion2),
          level: levelCounter++,
          conversion_Factor: Number(data.conversion2Qty),
        });
      }

      if (
        data.conversion3 &&
        data.conversion3 !== "None" &&
        data.conversion3Qty
      ) {
        levels.push({
          uom_ID: Number(data.conversion3),
          level: levelCounter++,
          conversion_Factor: Number(data.conversion3Qty),
        });
      }

      if (
        data.conversion4 &&
        data.conversion4 !== "None" &&
        data.conversion4Qty
      ) {
        levels.push({
          uom_ID: Number(data.conversion4),
          level: levelCounter++,
          conversion_Factor: Number(data.conversion4Qty),
        });
      }

      const payload: CreateUnitPresetPayload = {
        preset_Name: data.presetName,
        main_Unit_ID: Number(data.baseUnit),
        levels: levels,
      };

      const response = await createUnitPreset(payload);
      toast.success(
        response.message || "Packaging Preset Created Successfully",
      );
      handleCancelAddPreset();
    } catch (error: any) {
      console.error("Error creating preset:", error);
      toast.error(error?.response?.data || "Failed to create packaging preset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    toast.error(firstError?.message || "Please fill in all required fields");
  };

  console.log("Validation errors:", errors);

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSubmitForm, handleFormError)}
        className="flex flex-col flex-1 gap-5"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-semibold">Preset Name *</label>
            <input
              type="text"
              placeholder="Enter preset name (e.g., Weight Measurement)"
              className="input-style-3"
              {...register("presetName")}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label className="text-xs">Base Unit</label>

            <div className="flex gap-1">
              <select
                {...register("baseUnit")}
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
              >
                {getAvailableUnits(baseUnit).map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 1</label>

            <div className="flex gap-1">
              <select
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
                {...register("conversion1")}
              >
                <option value={"None"}>None</option>
                {getAvailableUnits(conversion1).map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                placeholder="qty x"
                className="input-style-3"
                {...register("conversion1Qty")}
              />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 2</label>

            <div className="flex gap-1">
              <select
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
                {...register("conversion2")}
              >
                <option value={"None"}>None</option>
                {getAvailableUnits(conversion2).map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                placeholder="qty x"
                className="input-style-3"
                {...register("conversion2Qty")}
              />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 3</label>

            <div className="flex gap-1">
              <select
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
                {...register("conversion3")}
              >
                <option value={"None"}>None</option>
                {getAvailableUnits(conversion3).map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                placeholder="qty x"
                className="input-style-3"
                {...register("conversion3Qty")}
              />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 4</label>

            <div className="flex gap-1">
              <select
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
                {...register("conversion4")}
              >
                <option value={"None"}>None</option>
                {getAvailableUnits(conversion4).map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="any"
                placeholder="qty x"
                className="input-style-3"
                {...register("conversion4Qty")}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <span className="text-vesper-gray text-xs">
            Note: The system only allow up to 5 unit conversions (including the
            Base Unit).
          </span>

          <div className="flex gap-1 w-full justify-center">
            <button
              type="submit"
              className="w-full max-w-max"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Confirm Packaging Preset"}
            </button>

            <button
              type="button"
              className="w-full max-w-max"
              onClick={handleCancelAddPreset}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

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
  conversion2: yup
    .string()
    .test(
      "minimum-conversions",
      "You must select at least 2 conversions (in addition to the Base Unit). Please select Conversion 2.",
      function (_value) {
        const { conversion1, conversion2, conversion3, conversion4 } =
          this.parent;
        const conversions = [
          conversion1,
          conversion2,
          conversion3,
          conversion4,
        ].filter((conv) => conv && conv !== "None");

        return conversions.length >= 2;
      },
    ),
  conversion2Qty: yup.string().when("conversion2", {
    is: (val: string) => val && val !== "None",
    then: (schema) =>
      schema.required(
        "Conversion 2 Quantity is required when Conversion 2 is selected",
      ),
  }),
  conversion3: yup.string(),
  conversion3Qty: yup.string().when("conversion3", {
    is: (val: string) => val && val !== "None",
    then: (schema) =>
      schema.required(
        "Conversion 3 Quantity is required when Conversion 3 is selected",
      ),
  }),
  conversion4: yup.string(),
  conversion4Qty: yup.string().when("conversion4", {
    is: (val: string) => val && val !== "None",
    then: (schema) =>
      schema.required(
        "Conversion 4 Quantity is required when Conversion 4 is selected",
      ),
  }),
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

  // Get all selected unit IDs (excluding None)
  const selectedUnitIds = [
    baseUnit,
    conversion1,
    conversion2,
    conversion3,
    conversion4,
  ].filter((unit) => unit && unit !== "None");

  // Count valid conversions (excluding base unit)
  const conversionCount = [
    conversion1,
    conversion2,
    conversion3,
    conversion4,
  ].filter((conv) => conv && conv !== "None").length;

  // Helper function to check if a unit is available for a specific field
  const isUnitAvailable = (unitId: number, currentFieldValue?: string) => {
    const unitIdStr = String(unitId);
    // Show the unit if it's not selected anywhere, or if it's the current field's value
    return (
      !selectedUnitIds.includes(unitIdStr) || unitIdStr === currentFieldValue
    );
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

        {(errors.conversion2?.message ||
          (conversionCount < 2 && conversionCount > 0)) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {errors.conversion2?.message ||
              "You must select at least 2 conversions (in addition to the Base Unit)"}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label className="text-xs">Base Unit</label>

            <div className="flex gap-1">
              <select
                {...register("baseUnit")}
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
              >
                {units.map((u, i) =>
                  isUnitAvailable(u.uom_ID, baseUnit) ? (
                    <option value={u.uom_ID} key={i}>
                      {u.uom_Name}
                    </option>
                  ) : null,
                )}
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
                {units.map((u, i) =>
                  isUnitAvailable(u.uom_ID, conversion1) ? (
                    <option value={u.uom_ID} key={i}>
                      {u.uom_Name}
                    </option>
                  ) : null,
                )}
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
                {units.map((u, i) =>
                  isUnitAvailable(u.uom_ID, conversion2) ? (
                    <option value={u.uom_ID} key={i}>
                      {u.uom_Name}
                    </option>
                  ) : null,
                )}
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
                {units.map((u, i) =>
                  isUnitAvailable(u.uom_ID, conversion3) ? (
                    <option value={u.uom_ID} key={i}>
                      {u.uom_Name}
                    </option>
                  ) : null,
                )}
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
                {units.map((u, i) =>
                  isUnitAvailable(u.uom_ID, conversion4) ? (
                    <option value={u.uom_ID} key={i}>
                      {u.uom_Name}
                    </option>
                  ) : null,
                )}
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
          <div className="flex flex-col gap-2">
            <span className="text-vesper-gray text-xs">
              Note: The system only allow up to 5 unit conversions (including
              the Base Unit).
            </span>
            <div
              className={`text-xs font-medium ${
                conversionCount < 2 ? "text-red-600" : "text-green-600"
              }`}
            >
              {conversionCount} conversion{conversionCount !== 1 ? "s" : ""}{" "}
              selected (minimum 2 required)
            </div>
          </div>

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

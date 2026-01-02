import { Separator } from "@/components/separator";
import { useUnitOfMeasureQuery } from "@/features/unit-of-measure/unit-of-measure";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";

interface PresetEditorFormProps {
  handleCancelAddPreset: () => void;
}

const schema = yup.object().shape({
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
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { data: units = [] } = useUnitOfMeasureQuery();

  const handleSubmitForm = (data: any) => {
    console.log("Form inputs:", data);
    toast.success("Packaging Preset Confirmed");
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
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label className="text-xs">Base Unit</label>

            <div className="flex gap-1">
              <select
                {...register("baseUnit")}
                // value={selectedUnit}
                // onChange={(e) => handleChangeUnit(Number(e.target.value))}
              >
                {units.map((u, i) => (
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
                {units.map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
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
                {units.map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
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
                {units.map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
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
                {units.map((u, i) => (
                  <option value={u.uom_ID} key={i}>
                    {u.uom_Name}
                  </option>
                ))}
              </select>
              <input
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
            <button type="submit" className="w-full max-w-max">
              Confirm Packaging Preset
            </button>

            <button
              type="button"
              className="w-full max-w-max"
              onClick={handleCancelAddPreset}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

import { Separator } from "@/components/separator";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

interface PresetEditorFormProps {
  handleCancelAddPreset: () => void;
}

const schema = yup.object().shape({
  baseUnit: yup.string().required("Base Unit is required"),
  conversion1: yup.string(),
  conversion2: yup.string(),
  conversion3: yup.string(),
  conversion4: yup.string(),
});

export const PresetEditorForm = ({
  handleCancelAddPreset,
}: PresetEditorFormProps) => {
  const { register, handleSubmit, watch } = useForm({
    resolver: yupResolver(schema),
  });

  const handleSubmitForm = (data: any) => {
    console.log("Form inputs:", data);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSubmitForm)}
        className="flex flex-col flex-1 gap-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label className="text-xs">Base Unit</label>

            <div className="flex gap-1">
              <select {...register("baseUnit")}>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
              </select>
              <input placeholder="qty x" className="input-style-3" />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 1</label>

            <div className="flex gap-1">
              <select {...register("conversion1")}>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
              </select>
              <input placeholder="qty x" className="input-style-3" />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 2</label>

            <div className="flex gap-1">
              <select {...register("conversion2")}>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
              </select>
              <input placeholder="qty x" className="input-style-3" />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 3</label>

            <div className="flex gap-1">
              <select {...register("conversion3")}>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
              </select>
              <input placeholder="qty x" className="input-style-3" />
            </div>
          </div>

          <Separator orientation="vertical" />

          <div className="flex flex-col">
            <label className="text-xs">Conversion 4</label>

            <div className="flex gap-1">
              <select {...register("conversion4")}>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
                <option>unit 1</option>
              </select>
              <input placeholder="qty x" className="input-style-3" />
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

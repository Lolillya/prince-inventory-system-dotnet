import { XIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { createUnitOfMeasure } from "@/features/unit-of-measure/add-unit-of-measure.service";

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = yup.object().shape({
  unitName: yup
    .string()
    .required("Unit name is required")
    .min(1, "Unit name must be at least 1 character")
    .max(50, "Unit name must not exceed 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Unit name must contain only letters and spaces"),
});

type FormData = {
  unitName: string;
};

export const AddUnitModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddUnitModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await createUnitOfMeasure({
        uom_Name: data.unitName,
      });

      toast.success(response.message || "Unit of measure created successfully");
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating unit of measure:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create unit of measure",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-96 bg-white px-6 py-8 rounded-lg border shadow-lg relative">
        <div
          className="absolute top-4 right-4 cursor-pointer"
          onClick={handleClose}
        >
          <XIcon className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold">Add New Unit</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new unit of measure
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="unitName" className="text-sm font-semibold">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                id="unitName"
                type="text"
                placeholder="e.g., DOZEN, CRATE, BAG"
                className={`border rounded-lg px-3 py-2 text-sm ${
                  errors.unitName ? "border-red-500" : "border-gray-300"
                }`}
                {...register("unitName")}
                disabled={isSubmitting}
              />
              {errors.unitName && (
                <span className="text-red-500 text-xs">
                  {errors.unitName.message}
                </span>
              )}
              <p className="text-xs text-gray-500">
                Note: Unit name will be automatically converted to uppercase
              </p>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                className="w-full max-w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Unit"}
              </button>
              <button
                type="button"
                className="w-full max-w-full"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

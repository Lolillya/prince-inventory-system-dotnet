import { XIcon } from "@/icons";
import AddProductForm from "./forms/AddProductForm";
import { Separator } from "@/components/separator";

export const AddProductModal = () => {
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div className="absolute top-4 right-4">
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-gray-500">
              Fill in the details to add a new product to the inventory.
            </p>
          </div>
        </div>

        <Separator />

        <AddProductForm />
      </div>
    </div>
  );
};

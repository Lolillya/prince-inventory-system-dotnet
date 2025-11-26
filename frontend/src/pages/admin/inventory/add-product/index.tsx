import { Separator } from "@/components/separator";
import AddProductForm from "./_components/forms/AddProductForm";

const AddProductPage = () => {
  return (
    <section>
      <div className="w-full">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-gray-500">
          Fill in the details to add a new product to the inventory.
        </p>
      </div>
      <Separator />
      <div className="max-w-2xl">
        <AddProductForm />
      </div>
    </section>
  );
};

export default AddProductPage;

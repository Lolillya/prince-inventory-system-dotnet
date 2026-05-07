import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
    item_Name: yup.string().required("Item name is required"),
});

type AddItemFormValues = {
    item_Name: string;
};

interface AddItemFormProps {
    setIsItemModalOpen: (isOpen: boolean) => void;
    setIsAddProductModalOpen: (isOpen: boolean) => void;
}

export const AddItemForm = ({
    setIsItemModalOpen,
    setIsAddProductModalOpen,
}: AddItemFormProps) => {
    const handleCancel = () => {
        setIsItemModalOpen(false);
        setIsAddProductModalOpen(true);
    };

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<AddItemFormValues>({
        resolver: yupResolver(schema),
    });

    const handleAddItem = async (data: AddItemFormValues) => {
        // API call will be handled by service
        setIsItemModalOpen(false);
        setIsAddProductModalOpen(true);
        reset();
    };

    return (
        <form
            className=" flex flex-col gap-5 overflow-y-scroll flex-1 justify-between"
            onSubmit={handleSubmit(handleAddItem)}
        >
            <div>
                <label htmlFor="item_Name" className="block text-sm font-medium">
                    Item Name
                </label>
                <input
                    id="item_Name"
                    type="text"
                    className="w-full drop-shadow-none bg-custom-gray p-2"
                    {...register("item_Name")}
                />
                <span className="text-red-500 text-xs normal-case">
                    {errors.item_Name?.message}
                </span>
            </div>
            <div className="flex gap-2">
                <button type="submit">Add Item</button>
                <button type="button" className="input-style-3" onClick={handleCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

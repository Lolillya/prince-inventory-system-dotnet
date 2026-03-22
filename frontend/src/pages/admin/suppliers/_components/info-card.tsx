import { useSetSupplierSelected } from "@/features/suppliers/supplier-selected.query";

import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { StarIcon, TrashIcon } from "@/icons";

type UserType = "customer" | "supplier" | "employee";

interface InfoCardProps extends SupplierDataModel {
  type: UserType;
  handleDelete?: () => void;
  setIsConfirmRemoveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const InfoCard = ({
  type,
  handleDelete,
  setIsConfirmRemoveModalOpen,
  ...data
}: InfoCardProps) => {
  const setSupplierSelected = useSetSupplierSelected();

  const handleClick = (user: SupplierDataModel) => {
    if (type === "supplier") setSupplierSelected(user);
  };

  return (
    <div
      className="hover:bg-custom-gray-lighter hover:cursor-pointer p-5 rounded-lg flex items-center justify-between"
      onClick={() => handleClick(data)}
    >
      <div className="flex items-center gap-5">
        <div className="bg-black h-11 w-11 rounded-lg"></div>

        <div className="flex flex-col">
          <span className="info-name">{data.company_Name}</span>
          <span className="info-id">{data.supplier_Id}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="info-card-actions rounded-lg hover:bg-tinker-yellow hover:text-laughing-orange transition-all duration-300 ">
          <StarIcon width={24} height={24} />
        </div>
        <div
          className="info-card-actions rounded-lg hover:bg-cake-pink hover:text-munch-pink transition-all duration-300"
          onClick={handleDelete}
        >
          <TrashIcon width={24} height={24} />
        </div>
      </div>
    </div>
  );
};

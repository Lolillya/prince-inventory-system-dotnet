import { StarIcon, TrashIcon } from "../icons";
import { UserClientModel } from "../models/user-client.model";
import { useSetSupplierSelected } from "../features/suppliers/supplier-selected.query";
import { useSetEmployeeSelected } from "../features/employees/empployee-selected.query";
import { useSetCustomerSelected } from "@/features/customers/customer-selector.query";

type UserType = "customer" | "supplier" | "employee";

interface InfoCardProps extends UserClientModel {
  type: UserType;
}

export const InfoCard = ({ type, ...data }: InfoCardProps) => {
  const setSupplierSelected = useSetSupplierSelected();
  const setCustomerSelected = useSetCustomerSelected();
  const setEmployeeSelected = useSetEmployeeSelected();

  const handleClick = (user: UserClientModel) => {
    if (type === "supplier") setSupplierSelected(user);
    if (type === "employee") setEmployeeSelected(user);
    if (type === "customer") setCustomerSelected(user);
  };

  return (
    <div
      className="hover:bg-custom-gray-lighter hover:cursor-pointer p-5 rounded-lg flex items-center justify-between"
      onClick={() => handleClick(data)}
    >
      <div className="flex items-center gap-5">
        <div className="bg-black h-11 w-11 rounded-lg"></div>

        <div className="flex flex-col">
          <span className="info-name">{data.companyName}</span>
          <span className="info-id">{data.id}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="info-card-actions rounded-lg hover:bg-tinker-yellow hover:text-laughing-orange transition-all duration-300 ">
          <StarIcon width={24} height={24} />
        </div>
        <div className="info-card-actions rounded-lg hover:bg-cake-pink hover:text-munch-pink transition-all duration-300">
          <TrashIcon width={24} height={24} />
        </div>
      </div>
    </div>
  );
};

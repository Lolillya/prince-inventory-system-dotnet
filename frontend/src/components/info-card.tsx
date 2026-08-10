import { StarIcon, TrashIcon } from "../icons";
import { UserClientModel } from "../models/user-client.model";
import { useSetEmployeeSelected } from "../features/employees/empployee-selected.query";
import { useSetCustomerSelected } from "@/features/customers/customer-selector.query";
import { Ban, UserMinus, UserPlus } from "lucide-react";

type UserType = "customer" | "supplier" | "employee";

interface InfoCardProps extends UserClientModel {
  type: UserType;
  handleDelete?: () => void;
  setIsConfirmRemoveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleActive?: () => void;
}

export const InfoCard = ({
  type,
  handleDelete,
  setIsConfirmRemoveModalOpen,
  onToggleActive,
  ...data
}: InfoCardProps) => {
  const setCustomerSelected = useSetCustomerSelected();
  const setEmployeeSelected = useSetEmployeeSelected();

  const handleClick = (user: UserClientModel) => {
    if (type === "employee") setEmployeeSelected(user);
    if (type === "customer") setCustomerSelected(user);
  };

  const isDeactivatedCustomer = type === "customer" && !data.isActive;

  return (
    <div
      className={`hover:bg-custom-gray-lighter hover:cursor-pointer p-5 rounded-lg flex items-center justify-between ${
        isDeactivatedCustomer ? "opacity-60" : ""
      }`}
      onClick={() => handleClick(data)}
    >
      <div className="flex items-center gap-5">
        <div className="bg-black h-11 w-11 rounded-lg"></div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="info-name">{data.companyName}</span>
            {isDeactivatedCustomer && (
              <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <Ban size={12} />
                Deactivated
              </span>
            )}
          </div>
          <span className="info-id">{data.id}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="info-card-actions rounded-lg hover:bg-tinker-yellow hover:text-laughing-orange transition-all duration-300 ">
          <StarIcon width={24} height={24} />
        </div>
        {type === "customer" ? (
          <div
            className={`info-card-actions rounded-lg transition-all duration-300 ${
              data.isActive
                ? "hover:bg-cake-pink hover:text-munch-pink"
                : "hover:bg-blue-100 hover:text-blue-600"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive?.();
            }}
          >
            {data.isActive ? (
              <UserMinus width={22} height={22} />
            ) : (
              <UserPlus width={22} height={22} />
            )}
          </div>
        ) : (
          <div
            className="info-card-actions rounded-lg hover:bg-cake-pink hover:text-munch-pink transition-all duration-300"
            onClick={handleDelete}
          >
            <TrashIcon width={24} height={24} />
          </div>
        )}
      </div>
    </div>
  );
};

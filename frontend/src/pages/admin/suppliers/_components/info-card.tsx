import { useSetSupplierSelected } from "@/features/suppliers/supplier-selected.query";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { StarIcon, TrashIcon } from "@/icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UserMinus, UserPlus } from "lucide-react";

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
          <div className="flex items-center gap-2">
            <span className="info-name">{data.company_Name}</span>
            {type === "supplier" && !data.is_Active && (
              <span className="bg-red-100 px-2 py-[3px] text-xs tracking-wide text-red-700 rounded-md border-2 border-red-200 uppercase font-semibold">
                Deactivated
              </span>
            )}
          </div>
          <span className="info-id">{data.supplier_Id}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="info-card-actions rounded-lg hover:bg-tinker-yellow hover:text-laughing-orange transition-all duration-300 ">
          <HoverCard>
            <HoverCardTrigger>
              <StarIcon width={24} height={24} />
            </HoverCardTrigger>
            <HoverCardContent className="w-fit p-2">
              <span className="text-sm">Set as favorites</span>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div
          className={`info-card-actions rounded-lg  ${data.is_Active ? "hover:text-munch-pink hover:bg-cake-pink" : "hover:text-blue-500 hover:bg-blue-200"} transition-all duration-300`}
          onClick={handleDelete}
        >
          <HoverCard>
            <HoverCardTrigger>
              {data.is_Active ? (
                <UserMinus width={24} height={24} />
              ) : (
                <UserPlus width={24} height={24} />
              )}
              {/* <TrashIcon width={24} height={24} /> */}
            </HoverCardTrigger>
            <HoverCardContent className="w-fit p-2">
              <span className="text-sm">
                {data.is_Active ? "Deactivate" : "Reactivate"} Supplier
              </span>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  );
};

import { XIcon } from "@/icons";
import { Dispatch, SetStateAction } from "react";
import { RecoverAccountForm } from "./forms/recover-account.form";

interface RecoverAccountModalProps {
  setIsRecoverAccountModalOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
}

export const RecoverAccountModal = ({
  setIsRecoverAccountModalOpen,
  userId,
}: RecoverAccountModalProps) => {
  const handleCloseModal = () => {
    setIsRecoverAccountModalOpen(false);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[480px] bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div
          className="absolute top-4 right-4 cursor-pointer hover:bg-bellflower-gray p-1 rounded"
          onClick={handleCloseModal}
        >
          <XIcon />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Recover Account</h1>
          <p className="text-gray-500 text-sm">
            Set a new password for this employee's account.
          </p>
        </div>
        <RecoverAccountForm
          userId={userId}
          setIsRecoverAccountModalOpen={setIsRecoverAccountModalOpen}
        />
      </div>
    </div>
  );
};

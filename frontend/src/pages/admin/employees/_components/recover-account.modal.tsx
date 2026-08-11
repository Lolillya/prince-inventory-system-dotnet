import { XIcon } from "@/icons";
import { Dispatch, SetStateAction } from "react";
import { RecoverAccountForm } from "./forms/recover-account.form";
import { ChangeUsernameForm } from "./forms/change-username.form";
import { LockKeyhole } from "lucide-react";
import { Separator } from "@/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLog } from "./audit-log";
import { useUserAuditLogQuery } from "@/features/employees/user-audit-log/user-audit-log.query";

interface RecoverAccountModalProps {
  setIsRecoverAccountModalOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
  username: string;
}

export const RecoverAccountModal = ({
  setIsRecoverAccountModalOpen,
  userId,
  username,
}: RecoverAccountModalProps) => {
  const { data: logs } = useUserAuditLogQuery(userId);
  const lastChange = logs?.[0];

  const handleCloseModal = () => {
    setIsRecoverAccountModalOpen(false);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[500px] bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-5">
        <div
          className="absolute top-4 right-4 cursor-pointer hover:bg-bellflower-gray p-1 rounded"
          onClick={handleCloseModal}
        >
          <XIcon />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 rounded-lg shrink-0">
            <LockKeyhole className="text-indigo-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Manage Authentication</h3>
            <p className="text-xs text-vesper-gray">
              Update credentials for this employee account.
            </p>
          </div>
        </div>

        {/* Last-change meta */}
        {lastChange && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-custom-gray rounded-lg text-xs text-vesper-gray">
            <span>Last changed by</span>
            <span className="font-semibold text-gray-700">
              {lastChange.adminUsername.toUpperCase()}
            </span>
            <span>·</span>
            <span>
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(lastChange.createdAt))}
            </span>
          </div>
        )}

        <Separator orientation="horizontal" />

        <Tabs defaultValue="recover-password">
          <TabsList variant="line">
            <TabsTrigger value="recover-password">Change Password</TabsTrigger>
            <TabsTrigger value="change-username">Change Username</TabsTrigger>
            <TabsTrigger value="audit-log">Audit Log</TabsTrigger>
          </TabsList>
          <TabsContent value="recover-password">
            <RecoverAccountForm
              userId={userId}
              setIsRecoverAccountModalOpen={setIsRecoverAccountModalOpen}
            />
          </TabsContent>
          <TabsContent value="change-username">
            <ChangeUsernameForm
              userId={userId}
              currentUsername={username}
              setIsRecoverAccountModalOpen={setIsRecoverAccountModalOpen}
            />
          </TabsContent>
          <TabsContent value="audit-log">
            <AuditLog userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

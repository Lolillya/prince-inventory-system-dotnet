import { Dispatch, SetStateAction, useRef } from "react";
import { Dialog } from "radix-ui";
import { RecoverAccountForm } from "./forms/recover-account.form";
import { LockKeyhole, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthenticationAuditLog } from "./audit-log";
import { useUserAuditLogQuery } from "@/features/employees/user-audit-log/user-audit-log.query";

interface RecoverAccountModalProps {
  setIsRecoverAccountModalOpen: Dispatch<SetStateAction<boolean>>;
  userId: string;
  username: string;
}

export const RecoverAccountModal = ({
  setIsRecoverAccountModalOpen,
  userId,
}: RecoverAccountModalProps) => {
  const { data: logs = [], isLoading, isError } = useUserAuditLogQuery(userId);
  const lastChange = logs[0];
  const previousFocus = useRef<HTMLElement | null>(null);

  const handleCloseModal = () => {
    setIsRecoverAccountModalOpen(false);
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => { if (!open) handleCloseModal(); }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Dialog.Content
            onOpenAutoFocus={() => {
              previousFocus.current = document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              previousFocus.current?.focus();
            }}
            onPointerDownOutside={(event) => event.preventDefault()}
            className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-[800px] flex-col overflow-y-auto rounded-lg border border-gray-200 bg-white text-slate-600 shadow-xl"
          >
            <div className="flex items-center gap-5 border-b border-gray-200 px-5 py-7 sm:px-8">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                <LockKeyhole className="text-indigo-500" size={30} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <Dialog.Title asChild>
                  <h3 className="text-xl font-semibold tracking-wide text-slate-700 sm:text-2xl">
                    Manage Authentication
                  </h3>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Admin-only password controls
                  </p>
                </Dialog.Description>
              </div>
              <button
                type="button"
                aria-label="Close Manage Authentication"
                onClick={handleCloseModal}
                className="h-9 w-9 max-w-none shrink-0 rounded-md bg-transparent p-2 text-slate-600 shadow-none hover:bg-slate-100 hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                <X size={24} strokeWidth={1.7} />
              </button>
            </div>

            <div className="space-y-1 border-b border-gray-200 px-5 py-5 text-sm leading-6 text-slate-500 sm:px-8 sm:text-base" aria-live="polite">
              {isLoading ? (
                <p>Loading latest change...</p>
              ) : isError ? (
                <p role="alert">Unable to load latest change.</p>
              ) : (
                <>
                  <p>Last updated by: <strong className="font-semibold text-slate-700">{lastChange?.adminUsername.toUpperCase() || "—"}</strong></p>
                  <p>Date: {lastChange ? formatAuditDate(lastChange.createdAt) : "—"}</p>
                </>
              )}
            </div>

            <Tabs defaultValue="recover-password" className="gap-0">
              <TabsList variant="line" className="group-data-[orientation=horizontal]/tabs:h-14 w-full justify-start gap-0 border-b border-gray-200 px-5 py-0 sm:px-8">
                <TabsTrigger value="recover-password" className={tabClassName}>Change Password</TabsTrigger>
                <TabsTrigger value="audit-log" className={tabClassName}>Audit Log</TabsTrigger>
              </TabsList>
              <TabsContent value="recover-password">
                <RecoverAccountForm
                  userId={userId}
                  setIsRecoverAccountModalOpen={setIsRecoverAccountModalOpen}
                />
              </TabsContent>
              <TabsContent value="audit-log">
                <AuthenticationAuditLog
                  logs={logs}
                  isLoading={isLoading}
                  isError={isError}
                  formatDate={formatAuditDate}
                  onClose={handleCloseModal}
                />
              </TabsContent>
            </Tabs>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const tabClassName = "h-full w-auto max-w-none flex-none rounded-none px-5 py-0 text-sm font-medium text-slate-500 shadow-none hover:text-emerald-600 hover:shadow-none data-[state=active]:text-emerald-600 data-[state=active]:font-semibold after:bg-emerald-600 group-data-[orientation=horizontal]/tabs:after:bottom-0 sm:px-7 sm:text-base";

const formatAuditDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = new Intl.DateTimeFormat("en-US", {
    month: "long", day: "2-digit", year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  }).format(date);

  return `${day} – ${time}`;
};

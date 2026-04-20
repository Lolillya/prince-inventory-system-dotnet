import { Separator } from "./separator";
import {
  EditIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  RightUpArrowIcon,
  UserIcon,
} from "../icons";
import { UserClientModel } from "../models/user-client.model";
import { useState } from "react";
import { Box, Calendar, CornerRightUp, Package } from "lucide-react";

import { InvoiceHistoryModal } from "./invoice-history-modal";

import { useCustomerInvoicesQuery } from "@/features/customers/customer-invoices.query";
import { useEmployeeInvoicesQuery } from "@/features/employees/employee-invoices.query";
import { useEmployeeRestocksQuery } from "@/features/employees/employee-restocks.query";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import { InvoiceDetailModal } from "@/pages/admin/invoice/_components/invoice-detail-modal";
import { ShowAllModal } from "@/pages/admin/restock/_components/all-items-modal";
import { EmployeeAllInvoicesModal } from "./employee-all-invoices-modal";
import { EmployeeAllRestocksModal } from "./employee-all-restocks-modal";

type UserType = "customer" | "supplier" | "employee";

interface SelectedUserProps extends UserClientModel {
  handleEdit: () => void;
  type: UserType;
}

export const SelectedUser = ({
  type,
  handleEdit,
  ...user
}: SelectedUserProps & { handleEdit: () => void }) => {
  const [isInvoiceHistoryModalOpen, setIsInvoiceHistoryModalOpen] =
    useState(false);
  const amountInReceivables = 5000; // scaffold placeholder

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="rounded-lg">
            <div className="bg-black h-12 w-12 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-base text-slate-700">{user.companyName}</p>
              {/* 
              <span className="rounded-full bg-cyan-200 px-2 py-[3px] text-sm tracking-wide text-cyan-700 capitalize">
                {user.supplier_Type}
              </span> */}
            </div>
            <p className="text-sm text-slate-400">{user.id}</p>
          </div>
        </div>
        <div
          className="cursor-pointer hover:bg-bellflower-gray p-3 rounded-lg transition-colors duration-300 text-vesper-gray"
          onClick={handleEdit}
        >
          <EditIcon />
        </div>
      </div>

      <Separator />

      {/* amount in receivables SECTION */}
      <div
        className="p-2 rounded-lg bg-wash-gray hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsInvoiceHistoryModalOpen(true)}
      >
        <div className=" flex items-center gap-3">
          <div className="bg-green-200 h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <span className="text-green-500 font-bold">₱</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 ">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold info-name flex gap-2">
                ₱{amountInReceivables.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="info-id text-sm">Amount in Receivables</p>
              <CornerRightUp size={18} className="text-vesper-gray" />
            </div>
          </div>
        </div>
      </div>

      {/* user FULLNAME SECTION */}
      <div className="p-2 rounded-lg bg-wash-gray">
        <div className=" flex items-center gap-3">
          <div className="bg-bellflower-gray h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <UserIcon />
          </div>
          <div className="flex flex-col justify-center">
            <p className="info-id text-sm">Representative</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold info-name ">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* user CONTACT NUMBER SECTION */}
      <div className="p-2 rounded-lg bg-wash-gray">
        <div className=" flex items-center gap-3">
          <div className="bg-bellflower-gray h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <PhoneIcon />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm info-id">Contact</p>
            <div className="flex items-center gap-2">
              <p className="text-sm info-name">{user.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* user EMAIL SECTION */}
      <div className="p-2 rounded-lg bg-wash-gray">
        <div className=" flex items-center gap-3">
          <div className="bg-bellflower-gray h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <MailIcon />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm info-id">Email</p>
            <div className="flex items-center gap-2">
              <p className="text-sm info-name">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* user ADDRESS SECTOIN */}
      <div className="p-2 rounded-lg bg-wash-gray">
        <div className="flex gap-3">
          <div className="bg-bellflower-gray h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <PinIcon />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-xs info-id">Address</p>
            <div className="flex flex-col">
              <span className="text-xs info-name">{user.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* user NOTES SECTION */}
      <div className="p-2 rounded-lg bg-wash-gray">
        <div className="flex gap-3 flex-col">
          <p className="text-xs text-slate-400">Notes</p>
          <div className="flex w-full gap-2">
            <textarea
              rows={3}
              value={user.notes}
              readOnly
              className="w-full resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {isInvoiceHistoryModalOpen && (
        <InvoiceHistoryModal
          customerId={user.id}
          setIsInvoiceHistoryModalOpen={setIsInvoiceHistoryModalOpen}
        />
      )}

      {/* USER ACTIONS SECTION */}
      {type === "supplier" && <SupplierActions />}
      {type === "customer" && <CustomerActions customerId={user.id} />}
      {type === "employee" && <EmployeeActions employeeId={user.id} />}
    </div>
  );
};

const SupplierActions = () => {
  const [isRestocksModalOpen, setIsRestocksModalOpen] = useState(false);

  return (
    <>
      {/* {isRestocksModalOpen && (
        <RestocksModal setIsRestocksModalOpen={setIsRestocksModalOpen} />
      )} */}
      <div className="p-2 rounded-lg bg-wash-gray flex shrink-0 flex-1 flex-col">
        <div className=" flex gap-3 items-center justify-between">
          <button
            className="bg-transparent text-vesper-gray font-semibold tracking-wide w-fit hover:bg-bellflower-gray"
            onClick={() => setIsRestocksModalOpen(true)}
          >
            Restocks
            <RightUpArrowIcon width={16} height={16} />
          </button>
          <label className="text-sm font-semibold text-vesper-gray">
            1 record/s
          </label>
        </div>

        {/* <div className="w-full h-full flex items-center justify-center">
        <span className="font-semibold info-name">No restock found</span>
      </div> */}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 px-2">
            <label className="text-saltbox-gray font-semibold">#xxxxxx</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-vesper-gray" size={16} />
                <label className="text-vesper-gray text-sm font-semibold">
                  3/2/2025
                </label>
              </div>
              <Separator orientation="vertical" className="flex-0!" />

              <div className="flex gap-2 items-center">
                <Box className="text-vesper-gray" size={16} />
                <label className="text-vesper-gray text-sm font-semibold">
                  100 items
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-2">
            <label className="text-saltbox-gray font-semibold">#xxxxxx</label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-vesper-gray" size={16} />
                <label className="text-vesper-gray text-sm font-semibold">
                  3/2/2025
                </label>
              </div>
              <Separator orientation="vertical" className="flex-0!" />

              <div className="flex gap-2 items-center">
                <Box className="text-vesper-gray" size={16} />
                <label className="text-vesper-gray text-sm font-semibold">
                  100 items
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const invoiceStatusTag = (status: string | null) => {
  if (!status) return null;
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    VOIDED: "bg-red-100 text-red-600",
  };
  const classes = map[status.toUpperCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${classes}`}
    >
      {status}
    </span>
  );
};

const CustomerActions = ({ customerId }: { customerId: string }) => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const { data: invoices, isLoading } = useCustomerInvoicesQuery(customerId);

  return (
    <>
      {isInvoiceModalOpen && (
        <InvoiceHistoryModal
          customerId={customerId}
          setIsInvoiceHistoryModalOpen={setIsInvoiceModalOpen}
        />
      )}
      <div className="p-2 rounded-lg bg-wash-gray flex shrink-0 flex-1 flex-col">
        <div className="flex gap-3 items-center justify-between">
          <button
            className="bg-transparent text-vesper-gray font-semibold tracking-wide w-fit hover:bg-bellflower-gray"
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            Invoices
            <RightUpArrowIcon width={16} height={16} />
          </button>
          <label className="text-sm font-semibold text-vesper-gray">
            {isLoading ? "..." : `${invoices?.length ?? 0} record/s`}
          </label>
        </div>

        {!isLoading && (!invoices || invoices.length === 0) && (
          <div className="w-full flex items-center justify-center py-4">
            <span className="font-semibold info-name">No invoice found</span>
          </div>
        )}

        {!isLoading && invoices && invoices.length > 0 && (
          <div className="flex flex-col gap-3 mt-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.invoice_ID}
                className="flex flex-col gap-1 px-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-saltbox-gray font-semibold">
                    #{invoice.invoice_Number}
                  </label>
                  {invoiceStatusTag(invoice.status)}
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-vesper-gray" size={14} />
                    <label className="text-vesper-gray text-xs font-semibold">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(invoice.createdAt))}
                    </label>
                  </div>
                  <Separator orientation="vertical" className="flex-0!" />
                  <div className="flex items-center gap-1">
                    <Box className="text-vesper-gray" size={14} />
                    <label className="text-vesper-gray text-xs font-semibold">
                      {invoice.lineItems.length} item/s
                    </label>
                  </div>
                  <Separator orientation="vertical" className="flex-0!" />
                  <label className="text-vesper-gray text-xs font-semibold">
                    ₱{invoice.total_Amount.toLocaleString()}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const restockStatusTag = (status: string | null) => {
  if (!status) return null;
  const map: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    VOIDED: "bg-red-100 text-red-600",
  };
  const classes = map[status.toUpperCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${classes}`}
    >
      {status}
    </span>
  );
};

const EmployeeActions = ({ employeeId }: { employeeId: string }) => {
  const [activeTab, setActiveTab] = useState<"restocks" | "invoices">(
    "restocks",
  );
  const [selectedRestock, setSelectedRestock] =
    useState<RestockAllModel | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceAllModel | null>(null);
  const [isAllRestocksModalOpen, setIsAllRestocksModalOpen] = useState(false);
  const [isAllInvoicesModalOpen, setIsAllInvoicesModalOpen] = useState(false);

  const { data: restocks, isLoading: restocksLoading } =
    useEmployeeRestocksQuery(employeeId);
  const { data: invoices, isLoading: invoicesLoading } =
    useEmployeeInvoicesQuery(employeeId);

  return (
    <>
      {selectedRestock && (
        <ShowAllModal
          selectedRestock={selectedRestock}
          onClose={() => setSelectedRestock(null)}
        />
      )}
      {selectedInvoice && (
        <InvoiceDetailModal
          selectedInvoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
      {isAllRestocksModalOpen && (
        <EmployeeAllRestocksModal
          restocks={restocks ?? []}
          onClose={() => setIsAllRestocksModalOpen(false)}
        />
      )}
      {isAllInvoicesModalOpen && (
        <EmployeeAllInvoicesModal
          invoices={invoices ?? []}
          onClose={() => setIsAllInvoicesModalOpen(false)}
        />
      )}

      <div className="p-2 rounded-lg bg-wash-gray flex min-h-0 flex-1 flex-col">
        <div className="p-2 flex gap-3 flex-col">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-1">
              <button
                className={`text-vesper-gray font-semibold tracking-wide text-sm px-2 py-1 rounded hover:bg-bellflower-gray ${
                  activeTab === "restocks"
                    ? "bg-bellflower-gray"
                    : "bg-transparent"
                }`}
                onClick={() => setActiveTab("restocks")}
              >
                Restocks
              </button>
              <div
                className="hover:bg-bellflower-gray p-1 rounded text-vesper-gray"
                onClick={() => setIsAllRestocksModalOpen(true)}
              >
                <RightUpArrowIcon width={14} height={14} />
              </div>

              <button
                className={`text-vesper-gray font-semibold tracking-wide text-sm px-2 py-1 rounded hover:bg-bellflower-gray ${
                  activeTab === "invoices"
                    ? "bg-bellflower-gray"
                    : "bg-transparent"
                }`}
                onClick={() => setActiveTab("invoices")}
              >
                Invoices
              </button>
              <div
                className="hover:bg-bellflower-gray p-1 rounded text-vesper-gray"
                onClick={() => setIsAllInvoicesModalOpen(true)}
              >
                <RightUpArrowIcon width={14} height={14} />
              </div>
            </div>

            <label className="text-sm font-semibold text-vesper-gray">
              {activeTab === "restocks"
                ? restocksLoading
                  ? "..."
                  : `${restocks?.length ?? 0} record/s`
                : invoicesLoading
                  ? "..."
                  : `${invoices?.length ?? 0} record/s`}
            </label>
          </div>
        </div>

        {/* RESTOCKS TAB */}
        {activeTab === "restocks" && (
          <div className="flex min-h-0 flex-1 flex-col">
            {restocksLoading && (
              <div className="w-full flex items-center justify-center py-4">
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            )}
            {!restocksLoading && (!restocks || restocks.length === 0) && (
              <div className="w-full flex items-center justify-center py-4 h-full">
                <span className="font-semibold info-name">
                  No restock found
                </span>
              </div>
            )}
            {!restocksLoading && restocks && restocks.length > 0 && (
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {restocks.map((restock) => (
                  <div
                    key={restock.restock_Id}
                    className="flex flex-col gap-1 px-2 py-2 rounded-lg hover:bg-bellflower-gray cursor-pointer transition-colors"
                    onClick={() => setSelectedRestock(restock)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package size={13} className="text-vesper-gray" />
                        <label className="text-saltbox-gray font-semibold text-sm cursor-pointer">
                          {restock.restock_Number}
                        </label>
                      </div>
                      {restockStatusTag(restock.status)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="text-vesper-gray" size={12} />
                        <label className="text-vesper-gray text-xs font-semibold">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(restock.created_At))}
                        </label>
                      </div>
                      <Separator orientation="vertical" className="flex-0!" />
                      <div className="flex items-center gap-1">
                        <Box className="text-vesper-gray" size={12} />
                        <label className="text-vesper-gray text-xs font-semibold">
                          {restock.line_Items.length} item/s
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === "invoices" && (
          <div className="flex min-h-0 flex-1 flex-col">
            {invoicesLoading && (
              <div className="w-full flex items-center justify-center py-4">
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            )}
            {!invoicesLoading && (!invoices || invoices.length === 0) && (
              <div className="w-full flex items-center justify-center py-4 h-full">
                <span className="font-semibold info-name">
                  No invoice found
                </span>
              </div>
            )}
            {!invoicesLoading && invoices && invoices.length > 0 && (
              <div className="mt-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoice_ID}
                    className="flex flex-col gap-1 px-2 py-2 rounded-lg hover:bg-bellflower-gray cursor-pointer transition-colors"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-saltbox-gray font-semibold text-sm cursor-pointer">
                        #{invoice.invoice_Number}
                      </label>
                      {invoiceStatusTag(invoice.status)}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="text-vesper-gray" size={12} />
                        <label className="text-vesper-gray text-xs font-semibold">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(invoice.createdAt))}
                        </label>
                      </div>
                      <Separator orientation="vertical" className="flex-0!" />
                      <div className="flex items-center gap-1">
                        <Box className="text-vesper-gray" size={12} />
                        <label className="text-vesper-gray text-xs font-semibold">
                          {invoice.lineItems.length} item/s
                        </label>
                      </div>
                      <Separator orientation="vertical" className="flex-0!" />
                      <label className="text-vesper-gray text-xs font-semibold">
                        ₱{invoice.total_Amount.toLocaleString()}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

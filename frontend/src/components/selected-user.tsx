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
import { Box, Calendar } from "lucide-react";
import { RestocksModal } from "./restocks-modal";

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
  return (
    <div className="flex flex-col p-5 w-full gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="rounded-lg">
            <div className="bg-black h-12 w-12 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-base text-slate-700">{user.companyName}</p>

              <span className="rounded-full bg-cyan-200 px-2 py-[3px] text-sm tracking-wide text-cyan-700 capitalize">
                {user.role}
              </span>
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
              className="w-full resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* USER ACTIONS SECTION */}
      {type === "supplier" && <SupplierActions />}
      {type === "customer" && <CustomerActions />}
      {type === "employee" && <EmployeeActions />}
    </div>
  );
};

const SupplierActions = () => {
  const [isRestocksModalOpen, setIsRestocksModalOpen] = useState(false);

  return (
    <>
      {isRestocksModalOpen && (
        <RestocksModal setIsRestocksModalOpen={setIsRestocksModalOpen} />
      )}
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

const CustomerActions = () => {
  return (
    <div className="p-2 rounded-lg bg-wash-gray flex shrink-0 flex-1 flex-col">
      <div className="p-2 flex gap-3 flex-col">
        <button className="bg-transparent text-vesper-gray font-semibold tracking-wide w-fit hover:bg-bellflower-gray">
          Invoices
          <RightUpArrowIcon width={16} height={16} />
        </button>
        <div className="flex w-full gap-2"></div>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        <span className="font-semibold info-name">No invoice found</span>
      </div>
    </div>
  );
};

const EmployeeActions = () => {
  const [restockActive, setRestockActive] = useState(true);
  const [invoiceActive, setInvoiceActive] = useState(false);

  const restockHandler = () => {
    setRestockActive(true);
    setInvoiceActive(false);
  };

  const invoiceHandler = () => {
    setInvoiceActive(true);
    setRestockActive(false);
  };

  return (
    <div className="p-2 rounded-lg bg-wash-gray flex shrink-0 flex-1 flex-col">
      <div className="p-2 flex gap-3 flex-col">
        <div className="flex w-full gap-2">
          <button
            className={`text-vesper-gray font-semibold tracking-wide w-fit hover:bg-bellflower-gray ${restockActive ? "bg-bellflower-gray" : "bg-transparent"}`}
            onClick={restockHandler}
          >
            Restocks
            <RightUpArrowIcon width={16} height={16} />
          </button>

          <button
            className={`text-vesper-gray font-semibold tracking-wide w-fit hover:bg-bellflower-gray ${invoiceActive ? "bg-bellflower-gray" : "bg-transparent"}`}
            onClick={invoiceHandler}
          >
            Invoices
            <RightUpArrowIcon width={16} height={16} />
          </button>
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {restockActive && (
          <span className="font-semibold info-name">No restock found</span>
        )}
        {invoiceActive && (
          <span className="font-semibold info-name">No invoice found</span>
        )}
      </div>
    </div>
  );
};

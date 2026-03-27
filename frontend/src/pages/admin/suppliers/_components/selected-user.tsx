import { useMemo, useState } from "react";
import {
  Box,
  Calendar,
  CornerRightUp,
  EditIcon,
  MailIcon,
  NotebookPen,
  Package,
  PhoneIcon,
  PinIcon,
} from "lucide-react";
import { format } from "date-fns";

import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { Separator } from "@/components/separator";
import { RightUpArrowIcon, UserIcon } from "@/icons";
import { RestocksModal } from "@/components/restocks-modal";
import { PurchaseOrderHistoryModal } from "./purchase-order-history.modal";
import { usePurchaseOrdersBySupplierQuery } from "@/features/purchase-order/purchase-order.query";

interface SelectedUserProps {
  handleEdit: () => void;
  selectedSupplier: SupplierDataModel;
  handlePurchasePrice: () => void;
}

export const SelectedUser = ({
  selectedSupplier,
  handleEdit,
  handlePurchasePrice,
}: SelectedUserProps & {
  handleEdit: () => void;
  handlePurchasePrice: () => void;
}) => {
  const [isRestocksModalOpen, setIsRestocksModalOpen] = useState(false);
  const [isPurchaseOrderHistoryModalOpen, setIsPurchaseOrderHistoryModalOpen] =
    useState(false);
  const { data: purchaseOrders = [] } = usePurchaseOrdersBySupplierQuery(
    selectedSupplier.supplier_Id,
  );

  const distinctLineItems = useMemo(() => {
    const allLineItems = selectedSupplier.restocks.flatMap((restock) =>
      restock.line_Items.map((lineItem) => ({
        key: lineItem.product_ID,
        line_Item_ID: lineItem.line_Item_ID,
        product_Name:
          lineItem.product?.product_Name ?? `Product #${lineItem.product_ID}`,
      })),
    );

    return Array.from(
      new Map(allLineItems.map((item) => [item.key, item])).values(),
    );
  }, [selectedSupplier.restocks]);

  const formatRestockDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "yyyy MMMM dd");
  };

  const pendingPurchaseOrderCount = purchaseOrders.filter(
    (po) => po.status?.toUpperCase() === "PENDING",
  ).length;

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="rounded-lg">
            <div className="bg-black h-12 w-12 rounded-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-base text-slate-700">
                {selectedSupplier.company_Name}
              </p>
              {/* 
              <span className="rounded-full bg-cyan-200 px-2 py-[3px] text-sm tracking-wide text-cyan-700 capitalize">
                {user.supplier_Type}
              </span> */}
            </div>
            <p className="text-sm text-slate-400">
              {selectedSupplier.supplier_Id}
            </p>
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
      <div
        className="p-2 rounded-lg bg-wash-gray hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={handlePurchasePrice}
      >
        <div className=" flex items-center gap-3">
          <div className="bg-blue-200 h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <NotebookPen className="text-blue-400" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 ">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold info-name flex gap-2">
                {distinctLineItems.length} Products
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="info-id text-sm">Supplier Purchase Price</p>
              <CornerRightUp size={18} className="text-vesper-gray" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-2 rounded-lg bg-wash-gray hover:cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsPurchaseOrderHistoryModalOpen(true)}
      >
        <div className=" flex items-center gap-3">
          <div className="bg-orange-200 h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
            <NotebookPen className="text-orange-400" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 ">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold info-name flex gap-2">
                {pendingPurchaseOrderCount} Pending
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="info-id text-sm">Purchase Order History</p>
              <CornerRightUp size={18} className="text-vesper-gray" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 rounded-lg bg-wash-gray flex items-center gap-3">
        <div className="bg-bellflower-gray h-10 w-10 rounded-lg flex items-center justify-center text-blouse-gray">
          <UserIcon />
        </div>

        <div className="flex flex-col justify-center">
          <p className="info-id text-sm">Representative</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold info-name ">
              {selectedSupplier.first_Name} {selectedSupplier.last_Name}
            </p>
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
              <p className="text-sm info-name">
                {selectedSupplier.phone_Number}
              </p>
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
              <p className="text-sm info-name">{selectedSupplier.email}</p>
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
              <span className="text-xs info-name">
                {selectedSupplier.address}
              </span>
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
              value={selectedSupplier.notes}
              readOnly
              className="w-full resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* USER ACTIONS SECTION */}
      <>
        {isPurchaseOrderHistoryModalOpen && (
          <PurchaseOrderHistoryModal
            selectedSupplier={selectedSupplier}
            setIsPurchaseOrderHistoryModalOpen={
              setIsPurchaseOrderHistoryModalOpen
            }
          />
        )}
        {isRestocksModalOpen && (
          <RestocksModal
            setIsRestocksModalOpen={setIsRestocksModalOpen}
            selectedSupplier={selectedSupplier}
          />
        )}
        <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-wash-gray p-2">
          <div className=" flex gap-3 items-center justify-between">
            <button
              className="bg-transparent text-vesper-gray font-semibold tracking-wide w-fit hover:bg-bellflower-gray "
              onClick={() => setIsRestocksModalOpen(true)}
            >
              Restocks
              <RightUpArrowIcon width={16} height={16} />
            </button>
            <label className="text-sm font-semibold text-vesper-gray px-2">
              {selectedSupplier.restocks.length} record/s
            </label>
          </div>

          {selectedSupplier.restocks.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-semibold info-name">No restock found</span>
            </div>
          ) : (
            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
              {selectedSupplier.restocks.map((r, i) => (
                <div
                  key={r.batch_Id ?? i}
                  className="flex flex-col gap-2 px-2 py-2"
                >
                  <label className="text-saltbox-gray font-semibold text-sm tracking-wide">
                    {r.restock_Info.restock_Number}
                  </label>
                  <div className="grid grid-cols-3 items-center text-vesper-gray text-xs font-semibold">
                    <div className="flex items-center gap-2 ">
                      <Calendar className="h-[18px] w-[18px] shrink-0 text-vesper-gray" />
                      <label className="text-vesper-gray text-sm font-semibold text-nowrap">
                        {formatRestockDate(r.created_At)}
                      </label>
                    </div>
                    {/* <Separator orientation="vertical" className="h-5 flex-none" /> */}

                    <div className="flex gap-2 items-center">
                      <Package className="h-[18px] w-[18px] shrink-0 text-vesper-gray" />
                      <label className="text-vesper-gray text-sm font-semibold text-nowrap">
                        {r.line_Items.reduce(
                          (total, lineItem) =>
                            total + lineItem.base_Unit_Quantity,
                          0,
                        )}{" "}
                        total quantity
                      </label>
                    </div>

                    {/* <Separator orientation="vertical" className="h-5 flex-none" /> */}

                    <div className="flex gap-2 items-center">
                      <Box className="h-[18px] w-[18px] shrink-0 text-vesper-gray" />
                      <label className="text-vesper-gray text-sm font-semibold text-nowrap">
                        {r.line_Items.length} product/s
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    </div>
  );
};

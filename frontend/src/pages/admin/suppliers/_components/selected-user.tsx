import { useMemo, useState } from "react";
import {
  Bot,
  Box,
  Calendar,
  CornerRightUp,
  EditIcon,
  History,
  MailIcon,
  NotebookPen,
  Package,
  PhoneIcon,
  PinIcon,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";

import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { Separator } from "@/components/separator";
import { RightUpArrowIcon, UserIcon } from "@/icons";
import { RestocksModal } from "@/components/restocks-modal";
import { PurchaseOrderHistoryModal } from "./purchase-order-history.modal";
import { usePurchaseOrdersBySupplierQuery } from "@/features/purchase-order/purchase-order.query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const isInternalSupplier =
    selectedSupplier.username?.toLowerCase() === "princeeducationalsupplies";

  console.log(selectedSupplier);

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

              {isInternalSupplier && (
                <span className="bg-purple-100 px-2 py-[3px] text-xs tracking-wide text-purple-700 p-2 rounded-md border-2 border-purple-200 uppercase font-semibold">
                  Internal
                </span>
              )}
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

      <Tabs className="w-full">
        <TabsList className="w-full gap-2">
          <TabsTrigger
            value="profile"
            className="w-full max-w-full bg-white! font-semibold text-vesper-gray
            data-[state=active]:bg-white
            data-[state=active]:text-blue-600
              data-[state=active]:border-b-2
            data-[state=active]:border-blue-600"
          >
            profile
          </TabsTrigger>
          <TabsTrigger
            value="restocks"
            className="w-full max-w-full bg-white font-semibold text-vesper-gray
            data-[state=active]:bg-white
            data-[state=active]:text-blue-600
              data-[state=active]:border-b-2
            data-[state=active]:border-blue-600"
          >
            restocks ({selectedSupplier.restocks.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="flex flex-col gap-4">
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
                    <p className="text-sm info-name">
                      {selectedSupplier.email}
                    </p>
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
          </div>
        </TabsContent>
        <TabsContent value="restocks">
          <div className="flex min-h-0 flex-1 flex-col p-2 ">
            <div className=" flex gap-3 items-center justify-between bg-wash-gray rounded-md">
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
              <div className="flex h-full w-full items-center justify-center mt-4">
                <span className="font-semibold info-name">
                  No restock found
                </span>
              </div>
            ) : (
              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {selectedSupplier.restocks.map((r, i) => (
                  <div
                    key={r.batch_Id ?? i}
                    className="grid grid-cols-[200px_1fr_1fr] gap-y-2  p-2 bg-wash-gray rounded-md"
                  >
                    <div className="flex gap-2 items-center">
                      <label className="text-xs text-nowrap font-semibold text-primary">
                        {r.restock_Info.restock_Number}
                      </label>

                      {r.restock_Info.restock_Number.match("AUTO-") && (
                        <div className="bg-purple-100 text-purple-500 p-1 rounded-md">
                          <Bot size={14} />
                        </div>
                      )}

                      {r.restock_Info.status !== "VOIDED" && (
                        <div className="bg-orange-100 text-orange-500 p-1 rounded-sm">
                          <History size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 items-center">
                      <Calendar className="h-[18px] w-[18px] shrink-0 text-vesper-gray" />
                      <label className="text-vesper-gray text-xs  text-nowrap">
                        {formatRestockDate(r.created_At)}
                      </label>
                    </div>

                    <div></div>

                    <label className="text-xs font-semibold text-vesper-gray text-nowrap">
                      {r.restock_Info.restock_Number.match("AUTO-")
                        ? r.restock_Info.restock_Invoice_Reference
                        : r.restock_Info.purchase_Order_Number}
                    </label>


                    <div className="flex gap-2 items-center ">
                      <Box className="h-[18px] w-[18px] shrink-0 text-vesper-gray" />
                      <label className="text-xs text-vesper-gray">
                        {r.line_Items.length} product/s
                      </label>
                    </div>

                    <div className="flex gap-2 items-center ">
                      <Package className="h-[18px] w-[18px] shrink-0 text-vesper-gray" />
                      <label className="text-vesper-gray text-xs text-nowrap">
                        {r.line_Items.reduce(
                          (total, lineItem) =>
                            total + lineItem.base_Unit_Quantity,
                          0,
                        )}{" "}
                        total quantity
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
      </>
    </div>
  );
};

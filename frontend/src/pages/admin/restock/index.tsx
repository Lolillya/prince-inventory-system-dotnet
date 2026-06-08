import { useRestockQuery } from "@/features/restock/restock-get-all";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import { SearchIcon, FilterIcon, PlusIcon } from "@/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShowAllModal } from "./_components/all-items-modal";
import { NoRestockState } from "./_components/no-restock-state";
import {
  Archive,
  Box,
  BoxIcon,
  Calendar,
  CornerRightUp,
  Ellipsis,
  Package,
  Pin,
  RotateCcw,
  Truck,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/separator";
import { useSetSupplierSelected } from "@/features/suppliers/supplier-selected.query";
import { GetAllSuppliers } from "@/features/suppliers/get-all-suppliers.service";
import { useVoidRestockMutation } from "@/features/restock/void-restock.query";
import { VoidRestockModal } from "./_components/void-restock.modal";
import { PO_RestockModal } from "./_components/po-restock.modal";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";

const RestockPage = () => {
  const navigate = useNavigate();
  const setSupplierSelected = useSetSupplierSelected();
  const { mutateAsync: voidRestockMutation, isPending: isVoidingRestock } =
    useVoidRestockMutation();
  const { data: restockItems } = useRestockQuery();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);
  const [isPORestockModalOpen, setIsPORestockModalOpen] =
    useState<boolean>(false);
  const [selectedRestock, setSelectedRestock] =
    useState<RestockAllModel | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  const handleOpenModal = (restock: RestockAllModel) => {
    setSelectedRestock(restock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestock(null);
  };

  const handleViewSupplier = async (restock: RestockAllModel) => {
    const supplier = restock.supplier;
    const fallbackSupplier: SupplierDataModel = {
      supplier_Id: supplier.id ?? "",
      username: "",
      email: supplier.email ?? "",
      first_Name: supplier.firstName ?? "",
      last_Name: supplier.lastName ?? "",
      company_Name: supplier.companyName ?? "",
      notes: "",
      phone_Number: "",
      address: "",
      restocks: [],
      total_Restock_Value: 0,
    };

    try {
      const response = await GetAllSuppliers();
      const suppliers = response?.data ?? [];
      const fullSupplier = suppliers.find(
        (item) => item.supplier_Id === supplier.id,
      );

      setSupplierSelected(fullSupplier ?? fallbackSupplier);
    } catch {
      setSupplierSelected(fallbackSupplier);
    }

    navigate("/admin/suppliers");
  };

  const handleVoidRestock = async (payload: {
    restockId: number;
    reason: string;
    password: string;
  }) => {
    if (isVoidingRestock) return;

    await voidRestockMutation(payload);
    setIsVoidModalOpen(false);
    setSelectedRestock(null);
  };

  const handleVoidPrompt = (r: RestockAllModel) => {
    if (isVoidingRestock) return;
    setSelectedRestock(r);
    setIsVoidModalOpen(true);
  };

  const handleCloseVoidModal = () => {
    setIsVoidModalOpen(false);
    setSelectedRestock(null);
  };

  console.log(restockItems);
  return (
    <section>
      {isPORestockModalOpen && (
        <PO_RestockModal onClose={() => setIsPORestockModalOpen(false)} />
      )}

      {isModalOpen && selectedRestock && (
        <ShowAllModal
          selectedRestock={selectedRestock}
          onClose={handleCloseModal}
        />
      )}

      {/* <Activity mode={isModalOpen && selectedLineItems ? "visible" : "hidden"}>
        <ShowAllModal
          lineItems={selectedLineItems}
          onClose={handleCloseModal}
        />
      </Activity> */}

      {isVoidModalOpen && selectedRestock && (
        <VoidRestockModal
          selectedRestock={selectedRestock}
          onClose={handleCloseVoidModal}
          onConfirm={handleVoidRestock}
          isVoiding={isVoidingRestock}
        />
      )}

      <div className="w-full mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 max-w-lg w-full shrink-0">
            <div className="relative w-full">
              <input placeholder="Search..." className="input-style-2" />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            <div className="p-3 bg-custom-gray rounded-lg">
              <FilterIcon />
            </div>
          </div>

          <div className="flex w/full justify-end gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-center gap-2">
                  <PlusIcon />
                  new restock
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <ul className="flex flex-col gap-1">
                  <li
                    className="text-sm cursor-pointer hover:underline"
                    onClick={() => navigate("/admin/restock/new")}
                  >
                    Manual
                  </li>
                  <li
                    className="text-sm cursor-pointer hover:underline"
                    onClick={() => setIsPORestockModalOpen(true)}
                  >
                    PO Restock
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto overflow-x-hidden pr-1">
        {restockItems?.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <NoRestockState />
          </div>
        ) : (
          restockItems
            ?.slice()
            .sort(
              (a, b) =>
                new Date(b.created_At).getTime() -
                new Date(a.created_At).getTime(),
            )
            .map((r) => (
              <div
                key={r.restock_Id}
                className="relative flex flex-col justify-between gap-5 border rounded-lg py-3 px-5 bg-custom-gray h-fit w-full break-inside-avoid"
              >
                <div className="absolute -top-1">
                  {r.status === "VOIDED" && (
                    <div className="bg-orange-200  text-xs px-2 py-1 rounded-b-lg shadow-md border-2 border-orange-300 font-semibold flex text-orange-500 items-center gap-2">
                      <RotateCcw size={14} />
                      reversed
                    </div>
                  )}

                  {r.restock_Number.match("AUTO-") && (
                    <div className="bg-purple-200 text-xs px-2 py-1 rounded-b-lg shadow-md border-2 border-purple-300 font-semibold flex items-center gap-2 text-purple-500">
                      <Package size={14} />
                      Auto Restock
                    </div>
                  )}
                </div>
                <div className="flex flex-1 p-3">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-5">
                        <span className="text-lg font-bold text-saltbox-gray tracking-wide">
                          #{r.restock_Number}
                        </span>

                        {r.purchase_order_number && (
                          <span className="text-sm font-semibold text-saltbox-gray border border-gray-200 rounded px-2 py-0.5">
                            PO {r.purchase_order_number}
                          </span>
                        )}
                        <Pin className="text-amber-300 rotate-45" size={20} />

                        <Popover
                          open={openPopoverId === r.restock_Id}
                          onOpenChange={(open) =>
                            setOpenPopoverId(open ? r.restock_Id : null)
                          }
                        >
                          <PopoverTrigger asChild className="cursor-pointer">
                            <Ellipsis className="text-saltbox-gray" />
                          </PopoverTrigger>
                          <PopoverContent className="w-fit">
                            <ul className="flex flex-col gap-1">
                              <li
                                className="text-sm cursor-pointer hover:underline"
                                onClick={() => {
                                  handleViewSupplier(r);
                                  setOpenPopoverId(null); // close popover
                                }}
                              >
                                View Supplier
                              </li>
                            </ul>
                            {r.status !== "VOIDED" && (
                              <>
                                <Separator orientation="horizontal" />
                                <ul>
                                  <li
                                    className={`text-sm hover:underline ${
                                      isVoidingRestock
                                        ? "text-red-300 cursor-not-allowed"
                                        : "text-red-400 cursor-pointer"
                                    }`}
                                    onClick={() => {
                                      handleVoidPrompt(r);
                                      setOpenPopoverId(null); // close popover
                                    }}
                                  >
                                    {isVoidingRestock
                                      ? "Processing..."
                                      : "Undo"}
                                  </li>
                                </ul>
                              </>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex flex-col flex-1">
                        <div className="flex gap-3 items-center">
                          <Calendar className="text-saltbox-gray" size={18} />
                          <span className="text-saltbox-gray text-sm">
                            {new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(new Date(r.created_At))}
                          </span>
                        </div>

                        <div className="h-4 border-l-2 ml-2 border-l-saltbox-gray/70 my-1" />

                        <div className="flex gap-3 items-center border-gray-300 ">
                          <Truck className="text-saltbox-gray" scale={18} />
                          <span className="text-saltbox-gray text-sm">
                            {r.supplier.companyName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-white shrink-0 h-fit">
                        <BoxIcon className="text-saltbox-gray" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-nowrap text-sm font-semibold text-vesper-gray tracking-wide">
                          Total Products
                        </label>

                        <span className="text-saltbox-gray text-base font-semibold">
                          {r.line_Items.length}{" "}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-white shrink-0 h-fit">
                        <Archive className="text-saltbox-gray" />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-nowrap text-sm font-semibold text-vesper-gray tracking-wide">
                          Total Quantity
                        </label>

                        <span className="text-saltbox-gray text-base font-semibold">
                          {r.line_Items.reduce(
                            (total, item) => total + item.base_Unit_Quantity,
                            0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-background rounded-lg flex flex-col p-3 gap-2">
                  <div className="flex w-full justify-between ">
                    <span className="text-saltbox-gray text-sm font-semibold">
                      {r?.line_Items[0].product.product_Name}
                    </span>
                    <span className="text-saltbox-gray text-xl font-semibold">
                      {r?.line_Items[0].base_Unit_Quantity}{" "}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-saltbox-gray">
                    <Box className="" size={18} />
                    <span className="text-sm text-saltbox-gray font-semibold">
                      1 Conversions
                    </span>
                  </div>
                </div> */}

                {/* <div className="bg-background rounded-lg flex items-center justify-center px-3 py-1"> */}
                <button
                  onClick={() => handleOpenModal(r)}
                  className="bg-background text-saltbox-gray w-full max-w-full cursor-pointer hover:underline hover:shadow-none hover:bg-gray-300 transition-colors"
                >
                  view details
                  <CornerRightUp size={18} />
                </button>
                {/* </div> */}
              </div>
            ))
        )}
      </div>
    </section>
  );
};

export default RestockPage;

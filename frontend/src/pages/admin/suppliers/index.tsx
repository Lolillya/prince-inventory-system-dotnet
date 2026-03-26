import { FilterIcon, PlusIcon, SearchIcon } from "@/icons";
import { useSuppliersQuery } from "@/features/suppliers/supplier-get-all.query";
import { useSelectedSupplierQuery } from "@/features/suppliers/supplier-selected.query";
import { Separator } from "@/components/separator";
import { NoSelectedState } from "@/components/no-selected-state";
import { Activity, Fragment, useState } from "react";
import { AddSupplierModal } from "./_components/add-supplier.modal";
import { EditSupplierModal } from "./_components/edit-supplier.modal";
import { ConfirmRemoveModal } from "./_components/confirm-remove.modal";
import { InfoCard } from "./_components/info-card";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { SelectedUser } from "./_components/selected-user";
import { toast } from "sonner";
import { PackageOpen, ShoppingCart } from "lucide-react";
import { PurchasePriceModal } from "./_components/purchase-price.modal";
import { PurchaseOrderModal } from "./_components/purchase-order.modal";

const SuppliersPage = () => {
  const { data: suppliers, isLoading, error } = useSuppliersQuery();
  const { data: selectedSupplier } = useSelectedSupplierQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] =
    useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [isPurchasePriceModalOpen, setIsPurchasePriceModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<SupplierDataModel | null>(
    null,
  );

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handleAddSupplier = () => {
    setIsAddSupplierModalOpen(!isAddSupplierModalOpen);
  };

  const handleEdit = () => {
    setIsEditSupplierModalOpen(!isEditSupplierModalOpen);
  };

  const handleDelete = (data: SupplierDataModel) => {
    if (data.restocks.length > 0) {
      toast.error("Cannot delete supplier with existing restocks");
      return;
    }

    setUserToDelete(data);
    setIsConfirmRemoveModalOpen(true);
  };

  const handlePurchasePrice = () => {
    setIsPurchasePriceModalOpen(!isPurchasePriceModalOpen);
  };

  const filteredSuppliers = suppliers?.filter((supplier) => {
    const query = searchQuery.toLowerCase();
    return (
      supplier.first_Name.toLowerCase().includes(query) ||
      supplier.last_Name.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      supplier.company_Name.toLowerCase().includes(query) ||
      supplier.phone_Number.toLowerCase().includes(query)
    );
  });

  return (
    <section>
      {/* ADD SUPPLIER MODAL */}
      {isAddSupplierModalOpen && (
        <AddSupplierModal
          setIsAddSupplierModalOpen={setIsAddSupplierModalOpen}
        />
      )}

      <Activity mode={isPurchasePriceModalOpen ? "visible" : "hidden"}>
        <PurchasePriceModal
          handlePurchasePrice={handlePurchasePrice}
          selectedSupplier={selectedSupplier ?? null}
        />
      </Activity>

      {/* EDIT SUPPLIER MODAL */}
      {isEditSupplierModalOpen && selectedSupplier && (
        <EditSupplierModal
          setIsEditSupplierModalOpen={setIsEditSupplierModalOpen}
          selectedSupplier={{
            id: selectedSupplier.supplier_Id,
            username: selectedSupplier.username,
            email: selectedSupplier.email,
            firstName: selectedSupplier.first_Name,
            lastName: selectedSupplier.last_Name,
            companyName: selectedSupplier.company_Name,
            address: selectedSupplier.address,
            phoneNumber: selectedSupplier.phone_Number,
            notes: selectedSupplier.notes,
            roleID: 3,
          }}
        />
      )}

      {/* PURCHASE ORDER MODAL */}
      {isPurchaseOrderModalOpen && (
        <PurchaseOrderModal
          setIsPurchaseOrderModalOpen={setIsPurchaseOrderModalOpen}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      {isConfirmRemoveModalOpen && userToDelete && (
        <ConfirmRemoveModal
          setIsConfirmRemoveModalOpen={setIsConfirmRemoveModalOpen}
          userId={userToDelete.supplier_Id}
        />
      )}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 max-w-lg w-full shrink-0">
            <div className="relative w-full">
              <input
                placeholder="Search..."
                className="input-style-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            <div className="p-3 bg-custom-gray rounded-lg">
              <FilterIcon />
            </div>
          </div>
          <button
            className="flex items-center justify-center gap-2"
            onClick={handleAddSupplier}
          >
            <PlusIcon />
            new supplier
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 overflow-y-hidden">
        {/*  LEFT PANEL */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-custom-gray p-1 rounded-lg flex justify-between shadow-sm border items-center">
            <div className="gap-10 flex items-center pl-2">
              <label className="capitalize text-saltbox-gray font-normal text-sm">
                suppiers
              </label>
              <span className="capitalize text-vesper-gray text-xs">
                {filteredSuppliers?.length} records
              </span>
            </div>
            <div className="flex gap-2 items-center rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none">
              <ShoppingCart size={18} />
              <label className="cursor-pointer">Generate Purchase Order</label>
            </div>
          </div>

          <div className="w-full overflow-y-scroll">
            {filteredSuppliers?.map((data, index) => (
              <Fragment key={index}>
                <InfoCard
                  type="supplier"
                  key={index}
                  {...data}
                  handleDelete={() => handleDelete(data)}
                  setIsConfirmRemoveModalOpen={setIsConfirmRemoveModalOpen}
                />
                <Separator />
              </Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex min-h-0 w-[50%] flex-col gap-3">
          <div className="bg-custom-gray px-3 py-4 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-sm">
              details
            </label>
          </div>

          <div className="flex h-full min-h-0 rounded-lg bg-custom-gray">
            {!selectedSupplier ? (
              <NoSelectedState />
            ) : (
              <SelectedUser
                selectedSupplier={selectedSupplier}
                handleEdit={handleEdit}
                handlePurchasePrice={handlePurchasePrice}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuppliersPage;

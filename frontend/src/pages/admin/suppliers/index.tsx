import { FilterIcon, PlusIcon, SearchIcon } from "@/icons";
import { useSuppliersQuery } from "@/features/suppliers/supplier-get-all.query";
import { useSelectedSupplierQuery } from "@/features/suppliers/supplier-selected.query";
import { Separator } from "@/components/separator";
import { NoSelectedState } from "@/components/no-selected-state";
import { Fragment, useState } from "react";
import { AddSupplierModal } from "./_components/add-supplier.modal";
import { EditSupplierModal } from "./_components/edit-supplier.modal";
import { ConfirmRemoveModal } from "./_components/confirm-remove.modal";
import { InfoCard } from "./_components/info-card";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { SelectedUser } from "./_components/selected-user";

const SuppliersPage = () => {
  const { data: suppliers, isLoading, error } = useSuppliersQuery();
  const { data: selectedSupplier } = useSelectedSupplierQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
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
    setUserToDelete(data);
    setIsConfirmRemoveModalOpen(true);
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

  // console.log(suppliers);

  return (
    <section>
      {/* ADD SUPPLIER MODAL */}
      {isAddSupplierModalOpen && (
        <AddSupplierModal
          setIsAddSupplierModalOpen={setIsAddSupplierModalOpen}
        />
      )}

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
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-sm">
              suppiers
            </label>
            <span className="capitalize text-vesper-gray text-xs">
              {filteredSuppliers?.length} records
            </span>
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
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
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
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuppliersPage;

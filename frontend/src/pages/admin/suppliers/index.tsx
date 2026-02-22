import { InfoCard } from "@/components/info-card";
import { FilterIcon, PlusIcon, SearchIcon } from "@/icons";
import { useSuppliersQuery } from "@/features/suppliers/supplier-get-all.query";
import { useSelectedSupplierQuery } from "@/features/suppliers/supplier-selected.query";
import { Separator } from "@/components/separator";
import { NoSelectedState } from "@/components/no-selected-state";
import { SelectedUser } from "@/components/selected-user";
import { Fragment, useState } from "react";
import { AddSupplierModal } from "./_components/add-supplier.modal";
import { EditSupplierModal } from "./_components/edit-supplier,modal";
import { UserClientModel } from "@/models/user-client.model";
import { ConfirmRemoveModal } from "./_components/confirm-remove.modal";

const SuppliersPage = () => {
  const { data: suppliers, isLoading, error } = useSuppliersQuery();
  const { data: selectedSupplier } = useSelectedSupplierQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<UserClientModel | null>(
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

  const handleDelete = (data: UserClientModel) => {
    setUserToDelete(data);
    setIsConfirmRemoveModalOpen(true);
  };

  const filteredSuppliers = suppliers?.filter((supplier) => {
    const query = searchQuery.toLowerCase();
    return (
      supplier.firstName.toLowerCase().includes(query) ||
      supplier.lastName.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      supplier.companyName.toLowerCase().includes(query) ||
      supplier.phoneNumber.toLowerCase().includes(query)
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

      {/* EDIT SUPPLIER MODAL */}
      {isEditSupplierModalOpen && selectedSupplier && (
        <EditSupplierModal
          setIsEditSupplierModalOpen={setIsEditSupplierModalOpen}
          selectedSupplier={{
            id: selectedSupplier.id,
            username: selectedSupplier.username,
            email: selectedSupplier.email,
            firstName: selectedSupplier.firstName,
            lastName: selectedSupplier.lastName,
            companyName: selectedSupplier.companyName,
            address: selectedSupplier.address,
            phoneNumber: selectedSupplier.phoneNumber,
            notes: selectedSupplier.notes,
            roleID: 3,
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      {isConfirmRemoveModalOpen && userToDelete && (
        <ConfirmRemoveModal
          setIsConfirmRemoveModalOpen={setIsConfirmRemoveModalOpen}
          userId={userToDelete.id}
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

      <div className="flex flex-1 gap-3 overflow-y-hidden">
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
              <Fragment key={data.id}>
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
        <div className="w-[50%] flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-sm">
              details
            </label>
          </div>

          <div className="h-full bg-custom-gray rounded-lg flex">
            {!selectedSupplier ? (
              <NoSelectedState />
            ) : (
              <SelectedUser
                type="supplier"
                {...selectedSupplier}
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

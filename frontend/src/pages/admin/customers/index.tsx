import { FilterIcon, PlusIcon, ReceiptPeso, SearchIcon } from "@/icons";
import { SelectedUser } from "@/components/selected-user";
import { NoSelectedState } from "@/components/no-selected-state";
import { Separator } from "@/components/separator";
import { useCustomersQuery } from "@/features/customers/customer-get-all.query";
import {
  useSelectedCustomer,
  useSetCustomerSelected,
} from "@/features/customers/customer-selector.query";
import { Fragment, useState } from "react";
import { AddCustomerModal } from "./_components/add-customer.modal";
import { EditCustomerModal } from "./_components/edit-customer,modal";
import { UserClientModel } from "@/models/user-client.model";
import { ConfirmRemoveModal } from "./_components/confirm-remove.modal";
import { CustomerSOAModal } from "./_components/customer-soa.modal";
import { useQueryClient } from "@tanstack/react-query";
import { UserModel } from "@/features/auth-login/models/user.model";
import { InfoCard } from "@/components/info-card";
import { Receipt } from "lucide-react";

const SuppliersPage = () => {
  const queryClient = useQueryClient();
  const { data: customers, isLoading, error } = useCustomersQuery();
  const { data: selectedCustomer } = useSelectedCustomer();
  const setCustomerSelected = useSetCustomerSelected();

  console.log(customers);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<UserClientModel | null>(
    null,
  );
  const [isSOAModalOpen, setIsSOAModalOpen] = useState(false);
  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handleAddCustomer = () => {
    setIsAddCustomerModalOpen(!isAddCustomerModalOpen);
  };

  const handleAddCustomerSuccess = (newCustomer: UserModel) => {
    // Add the new customer to the cache with proper formatting
    const newCustomerWithRole = {
      ...newCustomer,
      roleID: 4,
      role: "Customer", // Add the role field for tag display
    } as UserClientModel;

    // Update the cache with the new customer added to the list
    queryClient.setQueryData<UserClientModel[]>(["customer"], (oldData) => {
      if (!oldData) return [newCustomerWithRole];
      return [...oldData, newCustomerWithRole];
    });
  };

  const handleEdit = () => {
    setIsEditCustomerModalOpen(!isEditCustomerModalOpen);
  };

  const handleEditCustomerSuccess = (updatedCustomer: UserModel) => {
    // Update the selected customer in the query cache
    const updatedCustomerWithRole = {
      ...updatedCustomer,
      roleID: 3,
      role: "Customer", // Add the role field for tag display
    } as UserClientModel;
    setCustomerSelected(updatedCustomerWithRole);
    // Invalidate the customers query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["customer"] });
  };

  const handleDelete = (data: UserClientModel) => {
    setUserToDelete(data);
    setIsConfirmRemoveModalOpen(true);
  };

  const handleDeleteCustomerSuccess = (deletedUserId: string) => {
    // Invalidate the customers query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["customer"] });
    // Clear selected customer if the deleted customer was selected
    if (selectedCustomer?.id === deletedUserId) {
      queryClient.setQueryData(["invoice-customer"], null);
    }
  };

  const filteredCustomers = customers?.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.companyName.toLowerCase().includes(query) ||
      customer.phoneNumber.toLowerCase().includes(query)
    );
  });

  return (
    <section>
      {/* ADD CUSTOMER MODAL */}
      {isAddCustomerModalOpen && (
        <AddCustomerModal
          setIsAddCustomerModalOpen={setIsAddCustomerModalOpen}
          onSuccess={handleAddCustomerSuccess}
        />
      )}

      {/* EDIT CUSTOMER MODAL */}
      {isEditCustomerModalOpen && selectedCustomer && (
        <EditCustomerModal
          setIsEditCustomerModalOpen={setIsEditCustomerModalOpen}
          selectedCustomer={{
            id: selectedCustomer.id,
            username: selectedCustomer.username,
            email: selectedCustomer.email,
            firstName: selectedCustomer.firstName,
            lastName: selectedCustomer.lastName,
            companyName: selectedCustomer.companyName,
            address: selectedCustomer.address,
            phoneNumber: selectedCustomer.phoneNumber,
            notes: selectedCustomer.notes,
            roleID: 4,
            term: selectedCustomer.term,
          }}
          onSuccess={handleEditCustomerSuccess}
        />
      )}

      {/* SOA MODAL */}
      {isSOAModalOpen && (
        <CustomerSOAModal setIsSOAModalOpen={setIsSOAModalOpen} />
      )}

      {/* CONFIRM DELETE MODAL */}
      {isConfirmRemoveModalOpen && userToDelete && (
        <ConfirmRemoveModal
          setIsConfirmRemoveModalOpen={setIsConfirmRemoveModalOpen}
          userId={userToDelete.id}
          onSuccess={handleDeleteCustomerSuccess}
        />
      )}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 max-w-lg w-full shrink-0">
            <div className="relative w-full">
              <input
                placeholder="Search..."
                className="input-style-2"
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
            onClick={handleAddCustomer}
          >
            <PlusIcon />
            new customer
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-y-hidden">
        {/*  LEFT PANEL */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-custom-gray p-1 rounded-lg flex justify-between shadow-sm border items-center">
            <div className="flex gap-10 items-center pl-2">
              <label className="capitalize text-saltbox-gray font-normal text-sm">
                customers
              </label>
              <span className="capitalize text-vesper-gray text-xs">
                {filteredCustomers?.length} records
              </span>
            </div>

            <div
              className="flex gap-2 items-center rounded-lg bg-custom-gray hover:bg-background hover:shadow-md active:bg-background p-2 text-xs cursor-pointer duration-300 transition-all text-vesper-gray w-auto outline-none"
              onClick={() => setIsSOAModalOpen(true)}
            >
              <ReceiptPeso
                className="text-saltbox-gray"
                width={18}
                height={18}
              />
              <label className="text-saltbox-gray font-normal text-xs cursor-pointer">
                General Receivables
              </label>
            </div>
          </div>

          <div className="w-full overflow-y-scroll">
            {filteredCustomers?.map((data, index) => (
              <Fragment key={data.id}>
                <InfoCard
                  type="customer"
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

          <div className="h-full bg-custom-gray rounded-lg flex">
            {!selectedCustomer ? (
              <NoSelectedState />
            ) : (
              <SelectedUser
                type="customer"
                {...selectedCustomer}
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

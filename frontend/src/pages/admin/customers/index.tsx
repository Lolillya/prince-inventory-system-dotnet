import { InfoCard } from "@/components/info-card";
import { FilterIcon, PlusIcon, SearchIcon } from "@/icons";
import { SelectedUser } from "@/components/selected-user";
import { NoSelectedState } from "@/components/no-selected-state";
import { Separator } from "@/components/separator";
import { useCustomersQuery } from "@/features/customers/customer-get-all.query";
import { useSelectedCustomer } from "@/features/customers/customer-selector.query";
import { Fragment, useState } from "react";
import { AddCustomerModal } from "./_components/add-customer.modal";

const SuppliersPage = () => {
  const { data: customers, isLoading, error } = useCustomersQuery();
  const { data: selectedCustomer } = useSelectedCustomer();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handleAddCustomer = () => {
    setIsAddCustomerModalOpen(!isAddCustomerModalOpen);
  };

  const handleEdit = () => {};

  const handleDelete = () => {};

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
      {isAddCustomerModalOpen && (
        <AddCustomerModal
          setIsAddCustomerModalOpen={setIsAddCustomerModalOpen}
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
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-lg">
              suppiers
            </label>
            <span className="capitalize text-vesper-gray">
              {filteredCustomers?.length} records
            </span>
          </div>

          <div className="w-full overflow-y-scroll">
            {filteredCustomers?.map((data, index) => (
              <Fragment key={data.id}>
                <InfoCard
                  type="customer"
                  key={index}
                  {...data}
                  handleDelete={handleDelete}
                  setIsConfirmRemoveModalOpen={setIsConfirmRemoveModalOpen}
                />
                <Separator />
              </Fragment>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[70%] flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-lg">
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

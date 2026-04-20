import { Fragment, useState } from "react";
import { NoSelectedState } from "@/components/no-selected-state";
import { SelectedUser } from "@/components/selected-user";
import { Separator } from "@/components/separator";
import { FilterIcon, PlusIcon, SearchIcon } from "@/icons";
import { userEmployeesQuery } from "@/features/employees/employee-get-all.query";
import { useSelectedEmployeeQuery } from "@/features/employees/empployee-selected.query";
import { AddEmployeeModal } from "./_components/add-employee.modal";
import { UserClientModel } from "@/models/user-client.model";
import { EditEmployeeModal } from "./_components/edit-employee.modal";
import { ConfirmRemoveModal } from "./_components/confirm-remove.modal";
import { RecoverAccountModal } from "./_components/recover-account.modal";
import { InfoCard } from "@/components/info-card";
import { useAuth } from "@/context/use-auth";

const EmployeesPage = () => {
  const { data: employees, isLoading, error } = userEmployeesQuery();
  const { data: selectedEmployee } = useSelectedEmployeeQuery();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [isRecoverAccountModalOpen, setIsRecoverAccountModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<UserClientModel | null>(
    null,
  );

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const filteredEmployees = employees?.filter((employee) => {
    const query = searchQuery.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(query) ||
      employee.lastName.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.companyName.toLowerCase().includes(query) ||
      employee.phoneNumber.toLowerCase().includes(query)
    );
  });

  const handleAddEmployee = () => {
    setIsAddEmployeeModalOpen(!isAddEmployeeModalOpen);
  };

  const handleDelete = (data: UserClientModel) => {
    setUserToDelete(data);
    setIsConfirmRemoveModalOpen(true);
  };

  const handleEdit = () => {
    setIsEditEmployeeModalOpen(!isEditEmployeeModalOpen);
  };

  const handleRecover = () => {
    setIsRecoverAccountModalOpen(true);
  };

  return (
    <section>
      {/* ADD EMPLOYEE MODAL */}
      {isAdmin && isAddEmployeeModalOpen && (
        <AddEmployeeModal
          setIsAddEmployeeModalOpen={setIsAddEmployeeModalOpen}
        />
      )}

      {/* EDIT EMPLOYE MODAL */}
      {isEditEmployeeModalOpen && selectedEmployee && (
        <EditEmployeeModal
          setIsEditEmployeeModalOpen={setIsEditEmployeeModalOpen}
          selectedEmployee={{
            id: selectedEmployee.id,
            username: selectedEmployee.username,
            email: selectedEmployee.email,
            firstName: selectedEmployee.firstName,
            lastName: selectedEmployee.lastName,
            companyName: selectedEmployee.companyName,
            address: selectedEmployee.address,
            phoneNumber: selectedEmployee.phoneNumber,
            notes: selectedEmployee.notes,
            roleID: selectedEmployee.role?.toLowerCase() === "admin" ? 1 : 2,
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

      {/* RECOVER ACCOUNT MODAL */}
      {isAdmin && isRecoverAccountModalOpen && selectedEmployee && (
        <RecoverAccountModal
          setIsRecoverAccountModalOpen={setIsRecoverAccountModalOpen}
          userId={selectedEmployee.id}
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
          {isAdmin && (
            <button
              className="flex items-center justify-center gap-2"
              onClick={handleAddEmployee}
            >
              <PlusIcon />
              new employee
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-y-hidden">
        {/*  LEFT PANEL */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-sm">
              Employees
            </label>
            <span className="capitalize text-vesper-gray text-sm">
              {filteredEmployees?.length} records
            </span>
          </div>

          <div className="w-full overflow-y-scroll">
            {filteredEmployees?.map((data, index) => (
              <Fragment key={data.id}>
                <InfoCard
                  type="employee"
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
        <div className="w-[50%] min-h-0 flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center shrink-0">
            <label className="capitalize text-saltbox-gray font-normal text-sm">
              details
            </label>
          </div>

          <div className="min-h-0 bg-custom-gray rounded-lg flex flex-1">
            {!selectedEmployee ? (
              <NoSelectedState />
            ) : (
              <SelectedUser
                type="employee"
                {...selectedEmployee}
                handleEdit={handleEdit}
                handleRecover={isAdmin ? handleRecover : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeesPage;

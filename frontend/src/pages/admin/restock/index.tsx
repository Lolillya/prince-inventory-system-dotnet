import { Separator } from "@/components/separator";
import { useRestockQuery } from "@/features/restock/restock-get-all";
import { SearchIcon, FilterIcon, PlusIcon, EllipsisIcon } from "@/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShowAllModal } from "./_components/all-items-modal";
import { NoRestockState } from "./_components/no-restock-state";

const RestockPage = () => {
  const navigate = useNavigate();
  const { data: restockItems } = useRestockQuery();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  console.log(restockItems);
  return (
    <section>
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
            <button
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/admin/restock/new")}
            >
              <PlusIcon />
              new restock
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 overflow-y-scroll pb-5 pr-2 flex-1">
        {restockItems?.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <NoRestockState />
          </div>
        ) : (
          restockItems?.map((r, i) => (
            <>
              {isModalOpen && (
                <ShowAllModal lineItems={r.line_Items} onClose={handleModal} />
              )}
              <div
                key={i}
                className="flex flex-col justify-between gap-5 border shadow-lg rounded-lg p-5"
              >
                <div className="flex flex-1 p-3">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex gap-3">
                      <span>#{r.restock_Id}</span>
                      <span>-</span>
                      <span>ADD DATE TO RESTOCK MODEL</span>
                    </div>

                    <div className="flex gap-3">
                      <span>{r.supplier.companyName}</span>
                    </div>
                  </div>

                  <Separator orientation="vertical" />

                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex gap-3">
                      <span>grand total</span>
                    </div>

                    <div className="flex gap-3">
                      <span>P {r.grand_total}</span>
                    </div>
                  </div>

                  <div className="bg-gray-bg border flex items-center justify-center rounded-lg p-2 h-12 w-12 my-auto">
                    <EllipsisIcon />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button onClick={handleModal}>view all items</button>
                </div>
              </div>
            </>
          ))
        )}
      </div>
    </section>
  );
};

export default RestockPage;

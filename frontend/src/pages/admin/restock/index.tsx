import { useRestockQuery } from "@/features/restock/restock-get-all";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import { SearchIcon, FilterIcon, PlusIcon } from "@/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShowAllModal } from "./_components/all-items-modal";
import { NoRestockState } from "./_components/no-restock-state";
import {
  Box,
  Calendar,
  CornerRightUp,
  Ellipsis,
  Pin,
  Truck,
} from "lucide-react";

const RestockPage = () => {
  const navigate = useNavigate();
  const { data: restockItems } = useRestockQuery();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRestock, setSelectedRestock] =
    useState<RestockAllModel | null>(null);

  const handleOpenModal = (restock: RestockAllModel) => {
    setSelectedRestock(restock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestock(null);
  };
  console.log(restockItems);
  return (
    <section>
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
      <div className="columns-1 lg:columns-2 gap-5 overflow-y-scroll flex-1 space-y-5">
        {restockItems?.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <NoRestockState />
          </div>
        ) : (
          restockItems?.map((r) => (
            <div
              key={r.restock_Id}
              className="flex flex-col justify-between gap-5 border rounded-lg py-3 px-5 bg-custom-gray h-fit w-full break-inside-avoid"
            >
              <div className="flex flex-1 p-3">
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-5">
                      <span className="text-lg font-semibold text-saltbox-gray tracking-wide">
                        #{r.restock_Number}
                      </span>
                      <Pin className="text-amber-300 rotate-45" size={20} />
                      <Ellipsis className="text-saltbox-gray" />
                    </div>

                    <div className="flex items-center flex-1">
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

                      {/* <Separator orientation="vertical" /> */}

                      <div className="flex gap-3 items-center ml-5 border-l-2 border-gray-300 pl-5">
                        <Truck className="text-saltbox-gray" scale={18} />
                        <span className="text-saltbox-gray text-sm">
                          {r.supplier.companyName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <Separator orientation="vertical" /> */}

                <div className="flex flex-col justify-between">
                  <span className="text-saltbox-gray text-xl font-semibold text-right">
                    {r.line_Items.reduce(
                      (total, item) => total + item.base_Unit_Quantity,
                      0,
                    )}
                  </span>

                  <span className="text-nowrap text-saltbox-gray text-sm font-semibold">
                    added stock
                  </span>
                </div>

                {/* <div className="bg-gray-bg border flex items-center justify-center rounded-lg p-2 h-12 w-12 my-auto">
                  <EllipsisIcon />
                </div> */}
              </div>

              <div className="bg-background rounded-lg flex flex-col p-3 gap-2">
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
              </div>

              <div className="bg-background rounded-lg flex items-center justify-between px-3 py-1">
                <label className="text-saltbox-gray text-sm font-semibold tracking-wide">
                  No more items...
                </label>

                <button
                  onClick={() => handleOpenModal(r)}
                  className="bg-background text-saltbox-gray w-fit cursor-pointer hover:underline hover:shadow-none hover:bg-gray-300 transition-colors"
                >
                  view details
                  <CornerRightUp size={18} />
                </button>

                {/* <div className="flex w-full justify-between ">
                  <span className="text-saltbox-gray text-sm font-semibold">
                    Eraser - Gamma Goods - black
                  </span>
                  <span className="text-saltbox-gray text-sm font-semibold">
                    200
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-saltbox-gray">
                  <Box className="" size={18} />
                  <span className="text-sm text-saltbox-gray font-semibold">
                    1 Conversions
                  </span>
                </div> */}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default RestockPage;

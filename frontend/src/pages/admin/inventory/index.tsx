import { useNavigate } from "react-router-dom";
import { NoSelectedState } from "../../../components/no-selected-state";
import { Separator } from "../../../components/separator";
import { UseInventoryQuery } from "../../../features/inventory/get-inventory.query";
import {
  useSelectedProductQuery,
  useSetSelectedProduct,
} from "../../../features/inventory/product-selected";
import {
  EditIcon,
  FileDownIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "../../../icons";
import { SelectedProduct } from "./_components/selected-product";
import { useState } from "react";
import { AddProductModal } from "./add-product/_components/AddProductModal";
import { InventoryProductModel } from "@/models/trash/inventory.model";
import { EditProductModal } from "./_components/edit-product-modal";

const InventoryPage = () => {
  const { data: inventory, isLoading, error } = UseInventoryQuery();
  const { data: selectedProduct } = useSelectedProductQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const setSelectedProduct = useSetSelectedProduct();
  const navigate = useNavigate();

  console.log(selectedProduct);

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handleClick = (product: InventoryProductModel) => {
    setSelectedProduct(product);
  };

  const handleEditProduct = () => {
    setIsEditProductModalOpen(!isEditProductModalOpen);
  };

  return (
    <section>
      {/* HEADER */}
      {isModalOpen && (
        <AddProductModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {isEditProductModalOpen && selectedProduct && (
        <EditProductModal
          setIsEditProductModalOpen={setIsEditProductModalOpen}
          selectedProduct={selectedProduct}
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

          <div className="flex w-full justify-end gap-2">
            <div className="bg-custom-gray p-3 rounded-lg">
              <FileDownIcon />
            </div>
            <button
              className="flex items-center justify-center gap-2"
              onClick={() => setIsModalOpen(!isModalOpen)}
            >
              new item
              <PlusIcon />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex flex-1 gap-3 overflow-y-hidden">
        {/*  LEFT PANEL */}
        <div className="w-full flex flex-col gap-3">
          <div className="bg-custom-gray p-3 rounded-lg gap-10 flex items-center">
            <label className="capitalize text-saltbox-gray font-normal text-lg">
              records
            </label>
          </div>

          <div className="w-full overflow-y-scroll flex flex-col gap-2 pr-2">
            {inventory?.map((data, index) => (
              <>
                <div
                  className="flex justify-between p-5 rounded-lg"
                  key={index}
                  onClick={() => handleClick(data)}
                >
                  <div className="flex gap-2 items-center">
                    <span className="capitalize">
                      {data.product.productCode}
                    </span>
                    <span className="capitalize">{data.brand.brandName}</span>
                    <span className="capitalize">
                      {data.variant.variantName}
                    </span>
                  </div>
                  <div onClick={handleEditProduct}>
                    <EditIcon />
                  </div>
                </div>
                <Separator />
              </>
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

          <div className="h-full bg-custom-gray rounded-lg flex p-5">
            {!selectedProduct ? (
              <NoSelectedState />
            ) : (
              <SelectedProduct {...selectedProduct} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPage;

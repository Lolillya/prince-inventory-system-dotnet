import { NoSelectedState } from "@/components/no-selected-state";
import { LeftArrowIcon, SearchIcon } from "@/icons";
import { ProductCard } from "../../../../components/product-card";
import {
  useSelectedProductInvoiceQuery,
  useSelectedInvoiceProduct,
} from "@/features/invoice/selected-product";
// import { InvoiceCard } from "./_components/invoice-card";
import { useState } from "react";
import { CreateInvoiceModal } from "./_components/invoice-modal";
import { useInvoiceBatchQuery } from "@/features/invoice/invoice-get-all-batches";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import { InvoiceCard } from "./_components/invoice-card-copy";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";

const NewInvoicePage = () => {
  // GLOBAL STATES
  const { data: selectedInvoices = [] } = useSelectedProductInvoiceQuery();
  const { ADD_PRODUCT, REMOVE_PRODUCT, CLEAR_TO_INVOICE_LIST } =
    useSelectedInvoiceProduct();
  const { data: restockBatches, isLoading, error } = useInvoiceBatchQuery();
  const { data: inventoryData } = UseInventoryQuery();

  // console.log(restockBatches);

  // LOCAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handleClick = (data: InventoryProductModel) => {
    // TODO: Create invoice add product model from restock batch model
    // pass the whole batch object array
    // map batches to show different unit structure from restock suppliers
    // show different unit price options from restock suppliers
    // then add to selected invoice products

    ADD_PRODUCT(data);
  };

  const createInvoice = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleRemoveProduct = (product: InventoryProductModel) => {
    const updatedList = selectedInvoices.filter(
      (p) =>
        !(
          p.product.product_ID === product.product.product_ID &&
          p.variant.variant_Name === product.variant.variant_Name
        ),
    );
    // This will need to be handled through your state management
    // For now, you can use REMOVE_PRODUCT if the signature is fixed
  };

  return (
    <section>
      {isModalOpen && <CreateInvoiceModal createInvoice={createInvoice} />}
      <div className="flex flex-col min-h-0 flex-1 gap-5">
        <div className="flex flex-col gap-10">
          <div className="flex gap-3 border-b pb-5 items-center">
            <LeftArrowIcon />
            <span>new invoice</span>
            <span>#123456</span>
            {/* <span>{selectedProduct?.product.product_ID}</span> */}
          </div>
          {/* <Separator /> */}
        </div>

        <div className="flex flex-col gap-10 overflow-y-hidden flex-1">
          <div className="flex gap-5 overflow-y-hidden flex-1">
            {/* LEFT */}
            <div className="w-full flex">
              {selectedInvoices.length === 0 ? (
                <NoSelectedState />
              ) : (
                <div className="flex gap-2 flex-wrap h-full overflow-y-auto flex-1 pr-2">
                  {selectedInvoices.map((p, i) => (
                    <InvoiceCard
                      product={p}
                      itemId={String(i)}
                      onRemove={() => handleRemoveProduct(p)}
                      key={i}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-col w-2/5 gap-5">
              <div className="rounded-lg shadow-lg p-5 border h-full overflow-y-hidden flex-1 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <div className="relative w-full">
                    <input placeholder="Search..." className="input-style-2" />
                    <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <SearchIcon />
                    </i>
                  </div>
                </div>

                <div className="pr-2 flex flex-col gap-5 overflow-y-scroll flex-1 h-full">
                  {inventoryData?.map((data, i) => (
                    <ProductCard
                      product={data}
                      onClick={() => handleClick(data)}
                      key={i}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-5 justify-between">
                <button onClick={CLEAR_TO_INVOICE_LIST}>clear</button>
                <button onClick={createInvoice}>create invoice</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewInvoicePage;

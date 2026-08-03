import { NoSelectedState } from "@/components/no-selected-state";
import { LeftArrowIcon, SearchIcon } from "@/icons";
import { ProductCard } from "../../../../components/product-card";
import {
  useSelectedProductInvoiceQuery,
  useSelectedInvoiceProduct,
} from "@/features/invoice/selected-product";
// import { InvoiceCard } from "./_components/invoice-card";
import { Activity, useState } from "react";
import { CreateInvoiceModal } from "./_components/invoice-modal";
import { useInvoiceBatchQuery } from "@/features/invoice/invoice-get-all-batches";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import { InvoiceCard } from "./_components/invoice-card-copy";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { useSelectedPayloadInvoiceQuery } from "@/features/invoice/invoice-create-payload";
import { useNavigate } from "react-router-dom";

const NewInvoicePage = () => {
  const navigate = useNavigate();

  // GLOBAL STATES
  const { data: selectedInvoices = [] } = useSelectedProductInvoiceQuery();
  const { data: inventoryData } = UseInventoryQuery();
  const { data: payloadData = [] } = useSelectedPayloadInvoiceQuery();
  const { ADD_PRODUCT, REMOVE_PRODUCT, CLEAR_TO_INVOICE_LIST } =
    useSelectedInvoiceProduct();
  const { isLoading, error } = useInvoiceBatchQuery();

  console.log(payloadData);

  // LOCAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH DATA LOADING STATE
  if (isLoading) return <div>Loading...</div>;
  // FETCHING DATA ERROR STATE
  if (error) return <div>Error...</div>;

  const handleClick = (data: InventoryProductModel) => {
    ADD_PRODUCT(data);
  };

  const handleBack = () => {
    navigate("/admin/invoice");
  };

  const createInvoice = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleRemoveProduct = (itemKey: string) => {
    REMOVE_PRODUCT(itemKey);
  };

  const allCardsComplete =
    selectedInvoices.length > 0 &&
    payloadData.every(
      (p) =>
        p.invoice.preset_ID !== null &&
        p.invoice.unit_quantity > 0 &&
        p.invoice.unit_price > 0,
    );

  // For each invoice card, collect preset_IDs selected by OTHER cards of the same product+variant.
  const getExcludedPresetIds = (
    itemKey: string,
    productId: number,
    variantName: string,
  ): number[] => {
    return payloadData
      .filter(
        (p) =>
          p.invoice.itemKey !== itemKey &&
          p.invoice.product.product_ID === productId &&
          p.invoice.variant.variant_Name === variantName &&
          p.invoice.preset_ID !== null,
      )
      .map((p) => p.invoice.preset_ID as number);
  };

  return (
    <section>
      <Activity mode={isModalOpen ? "visible" : "hidden"}>
        <CreateInvoiceModal createInvoice={createInvoice} />
      </Activity>

      <div className="flex flex-col min-h-0 flex-1 gap-5">
        <div className="flex flex-col gap-10">
          <div className="flex gap-3 border-b pb-5 items-center">
            <div
              className="text-sm text-gray-500 hover:text-gray-700 flex gap-2 items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200 w-fit"
              onClick={handleBack}
            >
              <LeftArrowIcon />
              <span>Back</span>
            </div>
            <span>new invoice</span>
            <span>#123456</span>
          </div>
        </div>

        <div className="flex flex-col gap-10 overflow-y-hidden flex-1">
          <div className="flex gap-5 overflow-y-hidden flex-1">
            {/* LEFT */}
            <div className="w-full flex">
              {selectedInvoices.length === 0 ? (
                <NoSelectedState />
              ) : (
                <div className="flex gap-2 flex-wrap h-full overflow-y-auto flex-1 pr-2">
                  {selectedInvoices.map((item) => (
                    <InvoiceCard
                      product={item.data}
                      itemKey={item.itemKey}
                      excludePresetIds={getExcludedPresetIds(
                        item.itemKey,
                        item.data.product.product_ID,
                        item.data.variant.variant_Name,
                      )}
                      onRemove={() => handleRemoveProduct(item.itemKey)}
                      key={item.itemKey}
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
                    <input
                      placeholder="Search..."
                      className="input-style-2"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <SearchIcon />
                    </i>
                  </div>
                </div>

                <div className="pr-2 flex flex-col gap-5 overflow-y-scroll flex-1 h-full">
                  {inventoryData
                    ?.filter((data) => data.unitPresets?.length > 0)
                    .filter((data) =>
                      `${data.product.product_Name} ${data.brand.brandName} ${data.variant.variant_Name}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((data, i) => (
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
                <button
                  onClick={createInvoice}
                  disabled={!allCardsComplete}
                  className={
                    !allCardsComplete ? "opacity-50 cursor-not-allowed" : ""
                  }
                >
                  create invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewInvoicePage;

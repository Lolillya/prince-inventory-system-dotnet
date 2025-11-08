import { useNavigate } from "react-router-dom";
import { Separator } from "../../../components/separator";
import {
  EllipsisIcon,
  FileDownIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "../../../icons";
import { useInvoiceQuery } from "@/features/invoice/invoice-get-all";

const InvoicePage = () => {
  const { data: invoiceData, isLoading: isLoadingInvoice } = useInvoiceQuery();

  const navigate = useNavigate();
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
              onClick={() => navigate("/admin/invoice/new")}
            >
              <PlusIcon />
              new invoice
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 overflow-y-scroll pb-5 pr-2">
        {invoiceData?.map((i, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-5 border shadow-lg rounded-lg p-5"
          >
            <div className="flex flex-1 p-3">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3">
                  <span>{i.invoice_ID}</span>
                  <span>-</span>
                  <span>{i.createdAt}</span>
                </div>

                <div className="flex gap-3">
                  <span>{i.customer.companyName}</span>
                  <span>|</span>
                  <span>term:</span>
                  <span>{i.term}</span>
                </div>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3">
                  <span>grand total</span>
                </div>

                <div className="flex gap-3">
                  <span>P {i.total_Amount}</span>
                </div>
              </div>

              <div className="bg-gray-bg border flex items-center justify-center rounded-lg p-2 h-12 w-12 my-auto">
                <EllipsisIcon />
              </div>
            </div>

            <div className="flex justify-center">
              <span>view all</span>
            </div>
          </div>
        ))}
        {/* {[...Array(20)].map((_, idx) => (
          <div key={idx} className="flex flex-col justify-between gap-5 border shadow-lg rounded-lg p-5">
            <div className="flex flex-1 p-3">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3">
                  <span>#{String(123456 + idx)}</span>
                  <span>-</span>
                  <span>September 29, 2024</span>
                </div>

                <div className="flex gap-3">
                  <span>customer name</span>
                  <span>|</span>
                  <span>term:</span>
                  <span>00</span>
                </div>
              </div>

              <Separator orientation="vertical" />

              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3">
                  <span>grand total</span>
                </div>

                <div className="flex gap-3">
                  <span>P 0000.00</span>
                </div>
              </div>

              <div className="bg-gray-bg border flex items-center justify-center rounded-lg p-2 h-12 w-12 my-auto">
                <EllipsisIcon />
              </div>
            </div>

            <div className="flex justify-center">
              <span>view all</span>
            </div>
          </div>
        ))} */}
      </div>
    </section>
  );
};

export default InvoicePage;

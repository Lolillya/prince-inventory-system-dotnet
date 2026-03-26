import { ItemPicker } from "@/components/item-picker";
import { SupplierPicker } from "@/components/supplier-picker";
import { useSuppliersQuery } from "@/features/suppliers/supplier-get-all.query";
import { XIcon } from "@/icons";

interface PurchaseOrderModalProps {
  setIsPurchaseOrderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PurchaseOrderModal = ({
  setIsPurchaseOrderModalOpen,
}: PurchaseOrderModalProps) => {
  const handleCloseModal = () => {
    setIsPurchaseOrderModalOpen(false);
  };
  const { data: suppliersData } = useSuppliersQuery();

  console.log("Suppliers data in modal:", suppliersData); // Debug log to check suppliers data
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[800px] max-h-[90vh] overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div
            className="absolute top-4 right-4 cursor-pointer"
            onClick={handleCloseModal}
          >
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Create Purchase Order</h1>
            <p className="text-gray-500">
              Fill in purchase order details for supplier delivery planning.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SupplierPicker suppliersData={suppliersData} />

          {/* <label className="text-sm font-medium">Supplier</label>
          <input
            className="input-style-2"
            value=""
            placeholder="Supplier Name"
            readOnly
          /> */}

          <label className="text-sm font-medium">Preferred delivery</label>
          <input
            className="input-style-2"
            placeholder="Date / time / notes"
            // readOnly
            type="date"
          />

          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                data-empty={!date}
                className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
              >
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover> */}

          {/* <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vesper-gray">
              Search items
            </label>
            <div className="relative">
              <input
                className="input-style-2 pl-10"
                value=""
                placeholder="Search product..."
                readOnly
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
            </div>
          </div> */}
          <ItemPicker />

          <div className="border rounded-lg p-3 bg-custom-gray">
            <p className="text-sm text-gray-500">
              Product list will appear here (UI-only placeholder).
            </p>
            <div className="mt-3 h-36 bg-white rounded border flex items-center justify-center text-xs text-gray-400">
              Product lines preview
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            className="px-4 py-2 text-sm rounded border"
            onClick={handleCloseModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

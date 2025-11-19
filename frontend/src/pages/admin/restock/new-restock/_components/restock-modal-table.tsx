import { useAuth } from "@/context/use-auth";
import { createRestock } from "@/features/restock/create-restock.service";
import { useSelectedRestockProduct } from "@/features/restock/selected-restock";
import { useSelectedRestockSupplier } from "@/features/restock/selected-supplier";

export const RestockTable = () => {
  const { data: restockData } = useSelectedRestockProduct();
  const { data: supplier } = useSelectedRestockSupplier();
  const { user } = useAuth();

  console.log("restockData: ", restockData);

  const handleCreateRestock = () => {
    if (!restockData) console.log("Add Items for restock!");
    else createRestock(restockData, supplier?.id, user?.user_ID);
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      {/* TABLE DATA HEADERS */}
      <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
        <label className="text-left w-full">Item</label>
        <label className="text-left w-full">Quantity</label>
        <label className="text-left">Unit</label>
        <label className="text-right w-full">Unit Price</label>
        <label className="text-right w-full">Subtotal</label>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {restockData?.map((item, i) => (
          <div
            className={`py-3 px-5 flex justify-between text-sm gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
            key={i}
          >
            <span className="text-left w-full ">
              <div>
                <span>{item.restock.items.product.product_Name}</span>
                <span>-</span>
                <span>{item.restock.items.brand.brand_Name}</span>
                <span>-</span>
                <span>{item.restock.items.variant.variant_Name}</span>
              </div>
            </span>
            <span className="text-left w-full">
              {item.restock.unit_quantity}
            </span>
            <span className="text-left">{item.restock.unit}</span>
            <span className="text-right w-full">
              P {item.restock.unit_price}
            </span>

            <span className="text-right w-full">
              P {item.restock.unit_price * item.restock.unit_quantity}
            </span>
          </div>
        ))}
      </div>

      <span className="text-vesper-gray text-xs">
        Note: This order includes more than 10 items. We'll move the additional
        items to new invoices accordingly.
      </span>

      <div className="flex justify-between">
        <div className="flex flex-col">
          <div className="flex gap-2 font-bold tracking-wider">
            <span>TOTAL: </span>
            <label>P 0000.00</label>
          </div>
        </div>

        <button onClick={handleCreateRestock}>Save</button>
      </div>
    </div>
  );
};

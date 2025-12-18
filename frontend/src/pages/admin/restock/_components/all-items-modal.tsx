import { XIcon } from "@/icons";

interface Props {
  lineItems: {
    line_Item_ID: number;
    batch_Id: number;
    batch_Number: number;
    product: Product;
    base_Unit: Unit;
    base_Unit_Price: number;
    base_Unit_Quantity: number;
    unit_Conversions: Unit_Conversions[];
  }[];
  onClose: () => void;
}

type Product = {
  product_ID: number;
  product_Code: string;
  product_Name: string;
  description: string;
  brand: Brand;
  category: Category;
  variant: Variant;
};

type Brand = {
  brand_ID: number;
  brandName: string;
};

type Category = {
  category_ID: number;
  category_Name: string;
};

type Variant = {
  variant_ID: number;
  variant_Name: string;
};

type Unit = {
  uom_ID: number;
  uom_Name: string;
};

type Unit_Conversions = {
  product_UOM_Id: number;
  unit: Unit;
  parent_UOM_ID: number;
  conversion_Factor: number;
  unit_Price: number;
};

export const ShowAllModal = ({ lineItems, onClose }: Props) => {
  console.log("line-items", lineItems);
  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-5 flex-1 h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h2>All Line Items</h2>
            </div>
            <div onClick={onClose} className="cursor-pointer">
              <XIcon />
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="flex-1 flex flex-col overflow-hidden gap-2">
            {/* TABLE DATA HEADERS */}
            <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
              <label className="text-left w-full">Item</label>
              <label className="text-left w-full">Unit</label>
              <label className="text-right w-full">Unit Price</label>
              <label className="text-right w-full">Quantity</label>
              <label className="text-right w-full">Subtotal</label>
            </div>

            {/* TABLE DATA BODY */}
            <div className="overflow-auto flex flex-col h-full">
              {lineItems.map((item, i) => (
                <div
                  className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
                  key={i}
                >
                  <span className="text-left w-full">
                    {item.product?.product_Name || "N/A"}
                  </span>
                  <span className="text-left w-full">
                    {item.base_Unit.uom_Name}
                  </span>
                  <span className="text-right w-full">
                    P {item.base_Unit_Price?.toFixed(2) || "0.00"}
                  </span>
                  <span className="text-right w-full">
                    {item.base_Unit_Quantity}
                  </span>
                  <span className="text-right w-full">
                    P{" "}
                    {(item.base_Unit_Price * item.base_Unit_Quantity).toFixed(
                      2
                    ) || "0.00"}
                  </span>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="flex justify-between">
              <div className="flex flex-col">
                <div className="flex gap-2 font-bold tracking-wider">
                  <span>TOTAL ITEMS: </span>
                  <label>{lineItems.length}</label>
                </div>
              </div>

              <button onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

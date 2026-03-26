import {
  updateSelectedSupplier,
  useSelectedRestockSupplier,
} from "@/features/restock/selected-supplier";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { useState, useRef, useEffect } from "react";

export const SupplierPicker = ({
  suppliersData,
}: {
  suppliersData?: SupplierDataModel[];
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const ref = useRef<HTMLDivElement | null>(null);

  const { UPDATE_SELECTED_SUPPLIER } = updateSelectedSupplier();
  const { data: selectedSupplier } = useSelectedRestockSupplier();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const filtered = suppliersData?.filter((s) =>
    String(s.company_Name).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col w-full gap-2 relative" ref={ref}>
      <label className="text-vesper-gray">Supplier</label>
      <div className="flex w-full">
        <input
          className="w-full"
          placeholder="Supplier Name"
          value={selectedSupplier?.company_Name}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {open && (
        <div className="absolute w-full bg-white top-20 max-h-64 overflow-y-auto border shadow-lg rounded-lg p-3">
          {filtered && filtered.length > 0 ? (
            filtered.map((supplier, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  setQuery("");
                  setOpen(false);
                  UPDATE_SELECTED_SUPPLIER(supplier);
                }}
              >
                <div className="font-semibold">{supplier.company_Name}</div>
                <div className="text-xs text-vesper-gray">{supplier.email}</div>
              </div>
            ))
          ) : (
            <div className="text-vesper-gray">No suppliers found</div>
          )}
        </div>
      )}
    </div>
  );
};

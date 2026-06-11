import { Separator } from "@/components/separator";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import { useUpdateRestockNotesMutation } from "@/features/restock/update-restock-notes.query";
import { InvoiceIcon } from "@/icons";
import { Bot, Box, Calendar, NotebookText, Zap } from "lucide-react";
import { useState } from "react";

interface Props {
  selectedRestock: RestockAllModel;
  onClose: () => void;
}

export const ShowAllModal = ({ selectedRestock, onClose }: Props) => {
  const { mutateAsync: updateNotes, isPending: isSaving } =
    useUpdateRestockNotesMutation();
  const [notes, setNotes] = useState(selectedRestock.restock_Notes ?? "");
  const isDirty = notes !== (selectedRestock.restock_Notes ?? "");

  const handleSave = async () => {
    await updateNotes({ restockId: selectedRestock.restock_Id, notes });
    onClose();
  };

  console.log("selected-restock", selectedRestock);
  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-5 flex-1 h-full">
          {/* HEADER */}
          <div className="flex flex-col gap-2">
            {selectedRestock.restock_Number.match("AUTO-") && (
              <div className="flex items-center gap-2 border-2 border-purple-400 bg-purple-50 rounded-sm p-1 w-max">
                <Bot size={20} className="text-purple-800" />
                <label className="font-semibold text-xs text-purple-800">
                  Auto Restock
                </label>
              </div>
            )}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h3>{selectedRestock.restock_Number}</h3>
              </div>
              {/* <div onClick={onClose} className="cursor-pointer">
                <XIcon />
              </div> */}
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="text-vesper-gray" />
              <span className="font-semibold text-saltbox-gray">
                {new Date(selectedRestock.updated_At).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </span>
            </div>
          </div>

          <Separator />
          <div className="flex gap-3">
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-semibold">Supplier</label>
              <div className="relative">
                <input
                  value={selectedRestock.supplier.companyName}
                  className="input-style-3"
                />
                {selectedRestock.restock_Number.match("AUTO-") && (
                  <label className="text-purple-700 absolute left-50 top-1/6 text-xs border-2 border-purple-400 rounded-sm p-1 uppercase font-semibold">
                    internal
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 relative">
              <label className="text-sm font-semibold">Recorded by</label>

              <input
                value={
                  selectedRestock.clerk.firstName +
                  " " +
                  selectedRestock.clerk.lastName
                }
                className="input-style-3"
              />
            </div>
          </div>
          <Separator />

          {/* TABLE CONTAINER */}
          <div className="flex-1 flex flex-col overflow-hidden gap-2">
            {/* TABLE DATA HEADERS */}
            <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
              <label className="text-left w-full uppercase text-xs font-semibold">
                Product
              </label>
              <label className="text-left w-[70%] uppercase text-xs font-semibold">
                Conversion
              </label>
              <label className="text-left w-[30%] uppercase text-xs font-semibold">
                Quantity
              </label>
            </div>

            {/* TABLE DATA BODY */}
            <div className="overflow-auto flex flex-col h-full">
              {selectedRestock.line_Items.map((item, i) => (
                <div
                  className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
                  key={i}
                >
                  <div className="text-nowrap text-sm w-full">
                    <span>{item.product.product_Name}</span>
                  </div>
                  <span className="text-left w-[70%]">
                    {item.unit_Preset?.preset_Levels
                      ?.map(
                        (l) =>
                          l.unit?.uom_Name +
                          (l.conversion_Factor !== 1
                            ? ` (${l.conversion_Factor}x)`
                            : ""),
                      )
                      .filter(Boolean)
                      .join(" → ") || "No preset"}
                  </span>

                  <span className="text-left w-[30%]">
                    {item.base_Unit_Quantity} {item.base_Unit.uom_Name}
                  </span>
                </div>
              ))}
            </div>
            {selectedRestock.restock_Number.match("AUTO-") ? (
              <div className="flex flex-col gap-4 bg-purple-50 border-2 border-purple-400 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Bot className="text-purple-800" />
                  <label className="text-purple-800 font-semibold">
                    Auto Restock Information
                  </label>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-sm ">
                    <NotebookText size={21} className=" text-purple-800" />
                    <label className="font-semibold text-xs">
                      Linked Invoice:{" "}
                    </label>
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <Box size={21} className=" text-purple-800" />
                    <label className="font-semibold text-xs">Type: </label>
                    <label className="text-xs">Internal System Restock</label>
                  </span>
                  <span className="flex items-center gap-2 text-sm ">
                    <Zap size={21} className=" text-purple-800" />
                    <label className="text-xs">
                      Generated Automatically During Invoice Confirmation
                    </label>
                  </span>
                </div>
              </div>
            ) : (
              <textarea
                rows={4}
                placeholder="No restock notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="focus:outline-none p-2 resize-none border rounded"
              />
            )}

            {/* FOOTER */}
            <div className="flex justify-between">
              <div className="flex flex-col">
                <div className="flex gap-2 font-bold tracking-wider">
                  <span>TOTAL PRODUCTS:</span>
                  <label>{selectedRestock.line_Items.length}</label>
                </div>
                <div className="flex gap-2 font-bold tracking-wider">
                  <span>TOTAL QUANTITY: </span>
                  <label>
                    {selectedRestock.line_Items.reduce(
                      (total, item) => total + item.base_Unit_Quantity,
                      0,
                    )}
                  </label>
                </div>
              </div>

              <button
                onClick={isDirty ? handleSave : onClose}
                disabled={isSaving}
                className="disabled:opacity-50"
              >
                {isSaving ? "Saving..." : isDirty ? "Save" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

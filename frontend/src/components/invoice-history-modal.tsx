import { XIcon } from "@/icons";
import { Dispatch, SetStateAction } from "react";

interface InvoiceHistoryModalProps {
    setIsInvoiceHistoryModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const InvoiceHistoryModal = ({
    setIsInvoiceHistoryModalOpen,
}: InvoiceHistoryModalProps) => {
    const handleClose = () => setIsInvoiceHistoryModalOpen(false);

    return (
        <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
            <div className="w-[480px] max-h-[560px] bg-white px-8 py-6 rounded-lg border shadow-lg relative">
                <div className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg" onClick={handleClose}>
                    <XIcon />
                </div>
                <h1 className="text-2xl font-bold">Invoice History</h1>
                <p className="text-sm text-gray-500 mt-1">No invoice details available.</p>
            </div>
        </div>
    );
};

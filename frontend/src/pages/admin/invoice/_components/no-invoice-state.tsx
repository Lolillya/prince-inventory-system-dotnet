import { InvoiceIcon } from "@/icons";
export const NoInvoiceState = () => {
  return (
    <span className="text-saltbox-gray flex flex-col items-center  justify-center w-full">
      <InvoiceIcon width={300} height={300} />
      <span>No invoice record yet.</span>
    </span>
  );
};

import { RestockIcon } from "@/icons";
export const NoRestockState = () => {
  return (
    <span className="text-saltbox-gray flex flex-col items-center  justify-center w-full">
      <RestockIcon width={300} height={300} />
      <span>No restock records yet.</span>
    </span>
  );
};

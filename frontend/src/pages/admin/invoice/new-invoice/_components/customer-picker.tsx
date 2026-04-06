import { useState } from "react";

export const CustomerPicker = () => {
  const [customer, setCustomer] = useState("Prince Educational Supplies Inc.");
  const [term, setTerm] = useState("Net 30");

  return (
    <div className="flex flex-col w-full gap-2">
      <label className="text-sm font-medium text-gray-700">Customer &amp; Term</label>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 w-full">
        <input
          className="w-full rounded-lg border border-gray-300 bg-white"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer Name"
        />
        <select
          className="w-full rounded-lg border border-gray-300 bg-gray-50"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
          <option value="Net 30">Net 30</option>
          <option value="Net 15">Net 15</option>
          <option value="Due on Receipt">Due on Receipt</option>
        </select>
      </div>
    </div>
  );
};

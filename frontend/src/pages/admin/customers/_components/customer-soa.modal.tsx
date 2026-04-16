import { Search } from "lucide-react";

export const CustomerSOAModal = () => {
  return (
    <section>
      <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
        <div className="max-w-7xl w-full h-4/12 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
          <h1>Receivables</h1>

          <div className="relative">
            <Search className="absolute text-shadow-vesper-gray" />
            <input placeholder="Search" className="w-full max-w-full" />
          </div>

          <table>
            <thead>
              <tr>
                <td>Customer</td>
                <td>Total Balance</td>
                <td>Status</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Acme Corp.</td>
                <td>P 100,000.00</td>
                <td>PENDING</td>
              </tr>
            </tbody>
          </table>

          <div>
            {/* PENDING INVOICE DROPDOWN*/}

            {/* PAID INVOICE DROPDOWN */}
          </div>
        </div>
      </div>
    </section>
  );
};

import { XIcon } from "lucide-react";

export const ProductUnitPresetModal = () => {
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div className="absolute top-4 right-4">
          <XIcon />
        </div>

        <div className="w-full">
          <h1 className="">Packaging Presets</h1>
        </div>

        <div>
          <table className="w-full">
            <thead>
              <tr>
                <td>main</td>
                <td>conversions</td>
                <td>used by</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Box</td>
                <td>
                  <div>Box &gt; Cases &gt; Pieces</div>
                </td>
                <td># Products</td>
                <td>
                  <button className="input-style-3">More</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

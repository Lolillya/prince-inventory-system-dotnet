import axios from "axios";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";
import { BenchmarkPresetDetailModel } from "./supplier-benchmark.model";

export const GetBenchmarkPresetSuppliers = async (
  productId: number,
  presetId: number,
) => {
  try {
    const data = await axios.get<BenchmarkPresetDetailModel>(
      api + `benchmark/products/${productId}/presets/${presetId}/suppliers`,
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

import axios from "axios";
import { api } from "../../api/API.service";
import { handleError } from "../../../helpers/error-handler.helper";
import { BenchmarkProductItem } from "./supplier-benchmark.model";

export const GetBenchmarkOverview = async () => {
  try {
    const data = await axios.get<BenchmarkProductItem[]>(
      api + "benchmark/products",
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

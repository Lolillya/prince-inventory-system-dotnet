import { useQuery } from "@tanstack/react-query";
import { GetBenchmarkOverview } from "./get-benchmark-overview.service";
import { BenchmarkProductItem } from "./supplier-benchmark.model";

export const useBenchmarkOverviewQuery = () => {
  return useQuery<BenchmarkProductItem[]>({
    queryKey: ["benchmark-overview"],
    queryFn: async () => {
      const response = await GetBenchmarkOverview();
      if (!response) throw new Error("Failed to fetch benchmark overview");
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

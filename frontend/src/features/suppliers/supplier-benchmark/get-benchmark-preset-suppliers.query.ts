import { useQuery } from "@tanstack/react-query";
import { GetBenchmarkPresetSuppliers } from "./get-benchmark-preset-suppliers.service";
import { BenchmarkPresetDetailModel } from "./supplier-benchmark.model";

export const useBenchmarkPresetSuppliersQuery = (
  productId: number | null,
  presetId: number | null,
) => {
  return useQuery<BenchmarkPresetDetailModel>({
    queryKey: ["benchmark-preset-suppliers", productId, presetId],
    queryFn: async () => {
      const response = await GetBenchmarkPresetSuppliers(productId!, presetId!);
      if (!response)
        throw new Error("Failed to fetch benchmark preset suppliers");
      return response.data;
    },
    enabled: productId !== null && presetId !== null,
    staleTime: 30 * 1000,
  });
};

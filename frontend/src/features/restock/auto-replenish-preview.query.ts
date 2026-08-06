import { useQuery } from "@tanstack/react-query";
import { AutoReplenishPreview } from "./models/auto-replenish-preview.model";
import { autoReplenishPreviewService } from "./auto-replenish-preview.service";

export const useAutoReplenishPreviewQuery = (enabled: boolean) => {
  return useQuery<AutoReplenishPreview>({
    queryKey: ["auto-replenish-preview"],
    queryFn: () => autoReplenishPreviewService.getAutoReplenishPreview(),
    enabled,
    staleTime: 10 * 1000,
  });
};

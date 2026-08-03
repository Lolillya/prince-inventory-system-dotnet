import { InventoryProductModel } from "@/features/inventory/models/inventory.model";

type UnitPreset = NonNullable<InventoryProductModel["unitPresets"]>[number];
type PresetLevel = UnitPreset["preset"]["presetLevels"][number];

export type AvailableStockBreakdownEntry = {
  level: number;
  unitName: string;
  remaining: number;
  converted: number;
};

// Cumulative conversion factor to go FROM a given level's unit TO the
// target level's unit. Each presetLevel's conversion_Factor expresses how
// many units of that level make up one unit of the previous (larger)
// level, e.g. BOTTLE(1x) -> BOX(15x) -> TUBE(40x).
const getCumulativeFactor = (
  fromLevel: number,
  toLevel: number,
  levels: PresetLevel[],
): number => {
  if (fromLevel === toLevel) return 1;
  let factor = 1;
  for (const level of levels) {
    if (level.level <= fromLevel) continue;
    if (level.level > toLevel) break;
    factor *= level.conversion_Factor;
  }
  return factor;
};

// Available = the remaining/leftover quantity at EVERY level from the base
// unit up to (and including) the target unit, each converted into the
// target unit and summed together. This correctly accounts for leftovers
// of intermediate units instead of only converting the top-level (level 1)
// quantity directly.
export const getAvailableStockBreakdown = (
  product: InventoryProductModel,
  preset: UnitPreset | undefined,
  targetUnitLevel: number,
): AvailableStockBreakdownEntry[] => {
  if (!preset) return [];

  const presetQuantities = (preset as any).presetQuantities as
    | Array<{ level: number; remaining_Quantity?: number }>
    | undefined;

  const presetLevels = [...preset.preset.presetLevels].sort(
    (a, b) => a.level - b.level,
  );

  const breakdown: AvailableStockBreakdownEntry[] = [];

  for (const level of presetLevels) {
    if (level.level > targetUnitLevel) break;

    const remaining =
      (level.level === 1 && !presetQuantities?.length
        ? (product.product.quantity ?? 0)
        : (presetQuantities?.find((q) => q.level === level.level)
            ?.remaining_Quantity ?? 0)) || 0;

    if (remaining <= 0) continue;

    const factor = getCumulativeFactor(
      level.level,
      targetUnitLevel,
      presetLevels,
    );

    breakdown.push({
      level: level.level,
      unitName: level.unitOfMeasure.uom_Name,
      remaining,
      converted: remaining * factor,
    });
  }

  return breakdown;
};

export const calculateAvailableStock = (
  product: InventoryProductModel,
  preset: UnitPreset | undefined,
  targetUnitLevel: number,
): number => {
  const breakdown = getAvailableStockBreakdown(product, preset, targetUnitLevel);
  const total = breakdown.reduce((sum, b) => sum + b.converted, 0);
  return Math.floor(total);
};

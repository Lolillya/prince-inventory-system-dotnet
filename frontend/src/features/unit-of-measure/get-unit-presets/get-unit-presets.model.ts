export type UnitPresetLevel = {
  preset_ID: number;
  preset_Name: string;
  main_Unit_ID: number;
  main_Unit_Name: string;
  created_At: string;
  updated_At: string;
  levels: PresetLevels[];
  product_Count: number;
};

type PresetLevels = {
  level_ID: number;
  uoM_ID: number;
  uoM_Name: string;
  level: number;
  conversion_Factor: number;
};

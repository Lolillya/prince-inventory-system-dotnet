export interface UnitPresetLevel {
  uom_ID: number;
  level: number;
  conversion_Factor: number;
}

export interface CreateUnitPresetPayload {
  preset_Name: string;
  main_Unit_ID: number;
  levels: UnitPresetLevel[];
}

export interface CreateUnitPresetResponse {
  message: string;
  preset_ID: number;
}

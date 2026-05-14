import { api } from "@/features/api/API.service";
import axios from "axios";

export async function getNextPresetCode(): Promise<{ next_Code: string }> {
  const response = await axios.get<{ next_Code: string }>(
    `${api}unit-presets/next-code`,
  );
  return response.data;
}

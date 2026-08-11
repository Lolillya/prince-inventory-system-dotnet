import axios from "axios";
import { api } from "@/features/api/API.service";

export const CheckUsernameAvailabilityService = async (
  username: string,
  excludeUserId?: string,
): Promise<{ available: boolean; reason?: string }> => {
  const { data } = await axios.get(api + "check-username-availability", {
    params: { username, excludeUserId },
  });
  return data;
};

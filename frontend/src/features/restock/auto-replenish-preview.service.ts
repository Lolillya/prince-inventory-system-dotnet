import axios from "axios";
import { api } from "../api/API.service";
import { handleError } from "@/helpers/error-handler.helper";
import { AutoReplenishPreview } from "./models/auto-replenish-preview.model";

export const getAutoReplenishPreview = async () => {
  try {
    const response = await axios.get<AutoReplenishPreview>(
      api + "restock/preview-auto-replenish-number",
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const autoReplenishPreviewService = {
  getAutoReplenishPreview,
};

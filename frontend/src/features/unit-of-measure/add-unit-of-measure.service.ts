import { handleError } from "@/helpers/error-handler.helper";
import axios from "axios";
import { api } from "../api/API.service";

export interface CreateUnitOfMeasurePayload {
  uom_Name: string;
}

export interface CreateUnitOfMeasureResponse {
  uom_ID: number;
  uom_Name: string;
  message: string;
}

export const createUnitOfMeasure = async (
  payload: CreateUnitOfMeasurePayload,
) => {
  try {
    const response = await axios.post<CreateUnitOfMeasureResponse>(
      api + "uom-add",
      payload,
    );
    return response.data;
  } catch (e) {
    handleError(e);
    throw e;
  }
};

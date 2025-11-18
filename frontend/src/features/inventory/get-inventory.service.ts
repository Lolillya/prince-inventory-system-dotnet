import axios from "axios";
import { handleError } from "../../helpers/error-handler.helper";
import { api } from "../api/API.service";
import { InventoryModel } from "./models/inventory.model";

export const GetInventory = async () => {
  try {
    const data = await axios.get<InventoryModel>(api + "inventory/");
    return data;
  } catch (err) {
    handleError(err);
  }
};

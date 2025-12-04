import axios from "axios";
import { handleError } from "../../helpers/error-handler.helper";
import { api } from "../api/API.service";
import { InventoryProductModel } from "@/models/trash/inventory.model";

export const GetInventory = async () => {
  try {
    const data = await axios.get<InventoryProductModel>(api + "inventory/");
    return data;
  } catch (err) {
    handleError(err);
  }
};

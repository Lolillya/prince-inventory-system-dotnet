import axios from "axios";
import { handleError } from "../../helpers/error-handler.helper";
import { api } from "../api/API.service";
import { InventoryBatchesModel } from "./models/inventory-batches.model";

export const GetInventory = async () => {
  try {
    const data = await axios.get<InventoryBatchesModel>(
      api + "inventory-with-batches/"
    );
    return data;
  } catch (err) {
    handleError(err);
  }
};

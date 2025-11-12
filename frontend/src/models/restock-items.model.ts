import { LineItems } from "./line-items.model";

export type RestockItemsModel = {
  restock_Id: number;
  grand_total: number;
  line_Items: LineItems[];
  supplier: RestockSupplier;
  unit: string;
  unit_Price: number;
  sub_Total: number;
  quantity: number;
};

type RestockSupplier = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

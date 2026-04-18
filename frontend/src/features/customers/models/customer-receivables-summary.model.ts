export type CustomerReceivablesSummary = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  totalOutstandingBalance: number;
  overallStatus: "PAID" | "PENDING";
};

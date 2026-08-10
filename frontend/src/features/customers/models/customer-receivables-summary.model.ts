export type CustomerReceivablesSummary = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  totalOutstandingBalance: number;
  hasOverdue: boolean;
  hasPartiallyPaid: boolean;
  hasPending: boolean;
  allCollectibleInvoicesArePaid: boolean;
  allInvoicesAreVoided: boolean;
};

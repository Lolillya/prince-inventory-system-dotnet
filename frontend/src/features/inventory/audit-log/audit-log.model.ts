export type ProductAuditLog = {
  auditLog_ID: number;
  product_ID: number;
  product_Preset_ID?: number;
  userId: string;
  userName: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
};

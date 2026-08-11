export type UserAuditLog = {
  auditLog_ID: number;
  user_ID: string;
  adminUserId?: string;
  adminUsername: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
};

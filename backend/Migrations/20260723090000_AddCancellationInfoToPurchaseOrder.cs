// NOTE: This placeholder migration file is intentionally inert (no [Migration]
// attribute, no class), so it will not be picked up or compiled by EF tools.
//
// The C# model (PurchaseOrder.cs) and ApplicationDBContext.cs configuration
// have already been updated with the new Cancelled_By / Cancelled_At /
// Cancellation_Reason columns. To generate the real migration and apply it,
// run from the backend/ folder:
//
//   dotnet ef migrations add AddCancellationInfoToPurchaseOrder
//   dotnet ef database update
//
// This file can then be deleted (the command above will create a new,
// correctly-generated migration + Designer.cs + updated model snapshot).

import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/login";
import DashboardPage from "../pages/admin/dashboard";
import MainLayout from "../layouts/main-layout";
import DefaultLayout from "../layouts/default-layout";
import SuppliersPage from "../pages/admin/suppliers";
import CustomersPage from "../pages/admin/customers";
import InventoryPage from "../pages/admin/inventory";
import EmployeesPage from "../pages/admin/employees";
import { EditProductPage } from "../pages/admin/inventory/edit-product";
import InvoicePage from "../pages/admin/invoice";
import NewInvoicePage from "../pages/admin/invoice/new-invoice";
import RestockPage from "@/pages/admin/restock";
import NewRestockPage from "@/pages/admin/restock/new-restock";

export const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "admin/",
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "restock",
            element: <RestockPage />,
          },
          {
            path: "restock/new",
            element: <NewRestockPage />,
          },
          {
            path: "invoice",
            element: <InvoicePage />,
          },
          {
            path: "invoice/new",
            element: <NewInvoicePage />,
          },
          {
            path: "suppliers",
            element: <SuppliersPage />,
          },
          {
            path: "customers",
            element: <CustomersPage />,
          },
          {
            path: "inventory",
            element: <InventoryPage />,
          },
          {
            path: "inventory/:id/edit-product",
            element: <EditProductPage />,
          },
          {
            path: "employees",
            element: <EmployeesPage />,
          },
        ],
      },
    ],
  },
]);

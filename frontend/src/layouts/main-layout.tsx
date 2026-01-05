import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import ProtectedRoute from "../routes/protected-route";
import { Toaster } from "@/components/ui/sonner";

const MainLayout = () => {
  return (
    <ProtectedRoute>
      <main>
        <Sidebar />
        <Outlet />
        {/* <Toaster /> */}
      </main>
    </ProtectedRoute>
  );
};

export default MainLayout;

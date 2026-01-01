import Logo from "/Company_Logo.svg";
import { useAuth } from "../context/use-auth";
import { useNavigate } from "react-router-dom";
import {
  CustomersIcon,
  DashboardIcon,
  EmployeesIcon,
  InventoryIcon,
  InvoiceIcon,
  RestockIcon,
  SuppliersIcon,
} from "../icons";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  console.log(user);
  const sidebarContent = {
    main: {
      dashboard: {
        text: "Dashboard",
        redirect: "/admin/dashboard",
        icon: <DashboardIcon width={24} height={24} />,
      },
      restock: {
        text: "Restock",
        redirect: "/admin/restock",
        icon: <RestockIcon width={24} height={24} />,
      },
      invoice: {
        text: "Invoice",
        redirect: "/admin/invoice",
        icon: <InvoiceIcon width={24} height={24} />,
      },
    },
    records: {
      suppliers: {
        text: "Suppliers",
        redirect: "/admin/suppliers",
        icon: <SuppliersIcon width={24} height={24} />,
      },
      customers: {
        text: "Customers",
        redirect: "/admin/customers",
        icon: <CustomersIcon width={24} height={24} />,
      },
      inventory: {
        text: "Inventory",
        redirect: "/admin/inventory",
        icon: <InventoryIcon width={24} height={24} />,
      },
      employees: {
        text: "Employees",
        redirect: "/admin/employees",
        icon: <EmployeesIcon width={24} height={24} />,
      },
      // history: {
      //   text: "History",
      //   redirect: "/admin/history",
      //   icon: <History width={24} height={24} />,
      // },
    },
    // controls: {
    //   settings: {
    //     text: "Settings",
    //     redirect: "",
    //     icon: <Settings width={24} height={24} />,
    //   },
    //   about: {
    //     text: "About",
    //     redirect: "",
    //     icon: <Info width={24} height={24} />,
    //   },
    //   logout: {
    //     text: "Logout",
    //     redirect: "",
    //     icon: <LogOut width={24} height={24} />,
    //   },
    // },
  };
  return (
    <div className="bg-custom-bg-white px-5 py-10 max-w-82.5 w-full flex flex-col justify-between">
      <div className="flex flex-col">
        {/* LOGO */}
        <div className="flex items-center space-x-3.5 pb-5 pl-3">
          <img src={Logo} alt="Company Logo" width={35} />
          <h1>Prince</h1>
        </div>

        {/* TOP PANEL */}
        <div className="flex flex-col gap-1">
          {Object.entries(sidebarContent.main).map(([key, value]) => (
            <div
              key={key}
              className={`flex items-center rounded-lg p-3 transition-colors duration-300 hover:cursor-pointer hover:bg-white text-custom-black ${location.pathname === value.redirect && "bg-white shadow-md"}`}
              onClick={() => navigate(value.redirect)}
            >
              {value.icon}
              <span className="pl-5 text-lg">{value.text}</span>
            </div>
          ))}
        </div>

        {/* RECORDS LABEL */}
        <div className="py-2 pl-3">
          <label className="text-custom-black/70">Records</label>
        </div>

        {/* RECORDS PANEL */}
        <div className="flex flex-col gap-1">
          {Object.entries(sidebarContent.records).map(([key, value]) => (
            <div
              key={key}
              className={`flex items-center rounded-lg p-3 transition-colors duration-300 hover:cursor-pointer hover:bg-white text-custom-black ${location.pathname === value.redirect && "bg-white shadow-md"}`}
              onClick={() => navigate(value.redirect)}
            >
              {value.icon}
              <span className="pl-5 text-lg">{value.text}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => logout()}>Logout</button>

      {/* USER DETAILS PANEL */}
      <div className="flex items-center bg-white p-3 gap-3 rounded-full">
        <div className="rounded-full w-10 h-10 bg-pink-400 flex items-center justify-center">
          <span className="text-custom-bg-white">AA</span>
        </div>

        <div className="flex flex-col">
          <span className="font-bold uppercase">{user?.username}</span>
          <label className="capitalize">{user?.roleId}</label>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

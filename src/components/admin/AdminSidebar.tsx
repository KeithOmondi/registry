import React from "react";
import { Link, useLocation } from "react-router-dom";

interface AdminSidebarProps {}

export const AdminSidebar: React.FC<AdminSidebarProps> = () => {
  const location = useLocation();
  const menu = [
    { label: "Dashboard", path: "/admin" },
    { label: "Users", path: "/admin/users" },
    { label: "Records", path: "/admin/records" },
    { label: "Reports", path: "/admin/reports" },
  ];

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="text-lg font-bold mb-6">Admin Menu</div>
      <nav className="flex flex-col space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2 rounded hover:bg-gray-700 ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

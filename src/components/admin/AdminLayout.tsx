import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : "Admin";

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader userName={userName} />
        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  );
};

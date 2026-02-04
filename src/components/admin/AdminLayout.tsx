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
    : "Administrator";

  return (
    <div className="flex min-h-screen bg-[#f4f7f6]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <AdminHeader userName={userName} />

        <main className="p-4 md:p-10 max-w-[1600px] w-full mx-auto animate-in fade-in duration-500">
          {children}
        </main>

        <footer className="mt-auto p-8 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            The Judiciary of Kenya • Urithi System Admin v2.0
          </p>
        </footer>
      </div>
    </div>
  );
};

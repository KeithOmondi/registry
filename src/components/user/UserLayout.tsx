import React, { useState, type ReactNode } from "react";
import { UserSidebar } from "./UserSidebar";
import { UserHeader } from "./UserHeader";

interface UserLayoutProps {
  children: ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F1EA]">
      {/* SIDEBAR */}
      <UserSidebar
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE MENU BAR */}
        <div className="flex items-center bg-white sticky top-0 z-40 border-b border-slate-200 h-20 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-4 text-[#1E4332] hover:bg-slate-50 transition-colors"
            aria-label="Open Menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* MAIN HEADER */}
        <UserHeader />

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

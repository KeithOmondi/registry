import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: "Records",
    path: "/records",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: "Create Record",
    path: "/records/create",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Plus Circle Icon */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Not Forwarded",
    path: "/records/gp",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Clock/Pending Icon */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Scanned Records",
    path: "/records/scans",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Document Search/Scanner Icon */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>
    ),
  },
  {
    name: "Reports",
    path: "/records/reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

interface UserSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen, toggle }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#1a3a32] text-white
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 border-r border-white/5 shadow-2xl
        `}
      >
        {/* Header */}
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#b48222] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-white font-black text-2xl -rotate-3">J</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] leading-none mb-1">
                The Judiciary
              </span>
              <span className="text-lg font-black uppercase tracking-tighter text-white leading-none">
                Urithi Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggle();
              }}
              className={({ isActive }) => `
                flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest
                transition-all duration-200 group
                ${
                  isActive
                    ? "bg-[#b48222] text-white shadow-lg shadow-yellow-900/20 translate-x-1"
                    : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className="transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer Card */}
        <div className="p-6">
          <div className="bg-emerald-900/40 p-5 rounded-[1.5rem] border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[9px] font-black text-[#b48222] uppercase tracking-[0.2em] mb-2">
                Server Integrity
              </p>
              <div className="flex items-center gap-2">
                <div className="relative">
                   <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                   <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-emerald-100 uppercase">Registry Live</span>
              </div>
            </div>
            {/* Background design element */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#b48222]/10 rounded-full blur-2xl group-hover:bg-[#b48222]/20 transition-all" />
          </div>
          
          <div className="mt-6 flex flex-col items-center gap-1 opacity-40">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-100">
              Republic of Kenya
            </p>
            <div className="h-[1px] w-8 bg-emerald-100/20" />
          </div>
        </div>
      </aside>
    </>
  );
};
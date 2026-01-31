import React from "react";
import { Link, useLocation } from "react-router-dom";

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menu = [
    { label: "Dashboard", path: "/admin", icon: "📊" },
    { label: "User Management", path: "/admin/users", icon: "👥" },
    { label: "Master Records", path: "/admin/records", icon: "📂" },
    { label: "System Reports", path: "/admin/reports", icon: "📜" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#1a3a32] text-white flex flex-col shadow-2xl lg:sticky lg:top-0 lg:h-screen">
      {/* Branding Header */}
      <div className="h-24 flex items-center px-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#b48222] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-white font-black text-2xl -rotate-3">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] leading-none mb-1">
              The Judiciary
            </span>
            <span className="text-lg font-black uppercase tracking-tighter text-white leading-none">
              Admin Suite
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 group ${
                isActive
                  ? "bg-[#b48222] text-white shadow-lg shadow-yellow-900/20 translate-x-2"
                  : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin Footer Badge */}
      <div className="p-6 border-t border-white/5">
        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">
            Privileged Access
          </p>
          <p className="text-[11px] text-emerald-100/70 font-bold italic">
            Root Administrator Mode
          </p>
        </div>
      </div>
    </aside>
  );
};

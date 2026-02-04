import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  ChevronLeft,
  LayoutDashboard,
  Users,
  Database,
  BarChart3,
  ClipboardList,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menu = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Master Records",
      path: "/admin/records",
      icon: Database,
    },
    {
      label: "System Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
    {
      label: "System Entries",
      path: "/admin/entries",
      icon: ClipboardList,
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-[#1a3a32] text-white flex flex-col shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-[#b48222] text-white rounded-full p-1 shadow-xl hover:scale-110 transition-transform z-50"
      >
        {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Branding Header */}
      <div
        className={`h-24 flex items-center border-b border-white/5 overflow-hidden transition-all ${
          isCollapsed ? "px-4 justify-center" : "px-8"
        }`}
      >
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-[#b48222] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 shrink-0">
            <span className="text-white font-black text-2xl -rotate-3">A</span>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-500">
              <span className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] leading-none mb-1">
                The Judiciary
              </span>
              <span className="text-lg font-black uppercase tracking-tighter text-white leading-none">
                Admin Suite
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-x-hidden">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ""}
              className={`flex items-center gap-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 group ${
                isCollapsed ? "px-0 justify-center h-12" : "px-5 py-3.5"
              } ${
                isActive
                  ? "bg-[#b48222] text-white shadow-lg shadow-yellow-900/20 translate-x-1"
                  : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={2.2}
                className="shrink-0 group-hover:scale-110 transition-transform"
              />

              {!isCollapsed && (
                <span className="whitespace-nowrap animate-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Footer Badge */}
      {!isCollapsed && (
        <div className="p-6 border-t border-white/5 animate-in fade-in">
          <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">
              Privileged Access
            </p>
            <p className="text-[11px] text-emerald-100/70 font-bold italic">
              Root Administrator
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

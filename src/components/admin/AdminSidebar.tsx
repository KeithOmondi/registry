import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Clock, 
  Search, 
  BarChart3 
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Records", path: "/records", icon: <FileText size={20} /> },
  { name: "Create Record", path: "/records/create", icon: <PlusCircle size={20} /> },
  { name: "Not Forwarded", path: "/records/gp", icon: <Clock size={20} /> },
  { name: "Scanned Records", path: "/records/scans", icon: <Search size={20} /> },
  { name: "Reports", path: "/records/reports", icon: <BarChart3 size={20} /> },
];

interface AdminSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggle }) => {
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
          fixed inset-y-0 left-0 z-50 bg-[#1a3a32] text-white
          flex flex-col transition-all duration-300 ease-in-out
          border-r border-white/5 shadow-2xl
          ${isOpen ? "w-72" : "w-20 -translate-x-full lg:translate-x-0"} 
          lg:sticky lg:top-0 lg:h-screen
        `}
      >
        {/* Header Logo */}
        <div className={`h-24 flex items-center border-b border-white/5 overflow-hidden ${isOpen ? "px-8" : "justify-center"}`}>
          <div className="flex items-center gap-4">
            <div className="min-w-[48px] h-12 bg-[#b48222] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 flex-shrink-0">
              <span className="text-white font-black text-2xl -rotate-3">J</span>
            </div>
            {isOpen && (
              <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                <span className="text-[10px] font-black text-[#b48222] uppercase tracking-[0.2em] leading-none mb-1">
                  The Judiciary
                </span>
                <span className="text-lg font-black uppercase tracking-tighter text-white leading-none">
                  Urithi Portal
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-8 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && toggle()}
              className={({ isActive }) => `
                flex items-center rounded-xl text-[11px] font-black uppercase tracking-widest
                transition-all duration-200 group relative
                ${isOpen ? "px-5 py-3.5 gap-4" : "p-3.5 justify-center"}
                ${isActive
                  ? "bg-[#b48222] text-white shadow-lg translate-x-1"
                  : "text-emerald-100/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className="transition-transform group-hover:scale-110 flex-shrink-0">
                {item.icon}
              </span>
              
              {isOpen && (
                <span className="whitespace-nowrap animate-in fade-in duration-300">
                  {item.name}
                </span>
              )}

              {!isOpen && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left bg-[#b48222] text-white text-[10px] px-3 py-2 rounded-md shadow-xl z-[60] whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Status Card */}
        <div className={`p-4 border-t border-white/5 ${!isOpen && "flex flex-col items-center"}`}>
          <div className={`bg-emerald-900/40 rounded-2xl border border-white/5 relative overflow-hidden group transition-all ${isOpen ? "p-4" : "p-3"}`}>
            <div className="relative z-10">
              {isOpen ? (
                <>
                  <p className="text-[9px] font-black text-[#b48222] uppercase tracking-[0.2em] mb-2">Registry Status</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                      <span className="relative block w-2 h-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-100 uppercase">Live Connection</span>
                  </div>
                </>
              ) : (
                <span className="relative flex h-3 w-3">
                  <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                  <span className="relative block h-3 w-3 rounded-full bg-emerald-400" />
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
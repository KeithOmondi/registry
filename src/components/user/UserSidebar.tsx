import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, FileStack, PlusCircle, 
  Clock, ScanLine, BarChart3
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Records", path: "/records", icon: <FileStack size={20} /> },
  { name: "Create Record", path: "/records/create", icon: <PlusCircle size={20} /> },
  { name: "Not Forwarded", path: "/records/gp", icon: <Clock size={20} /> },
  { name: "Scanned Records", path: "/records/scans", icon: <ScanLine size={20} /> },
  { name: "Reports", path: "/records/reports", icon: <BarChart3 size={20} /> },
];

interface UserSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({ isOpen}) => {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-[60] bg-[#1a3a32] text-white
        flex flex-col transition-all duration-500 ease-in-out border-r border-white/5 shadow-2xl
        ${isOpen ? "w-72" : "w-20"}
        ${!isOpen ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
      `}
    >
      {/* Brand Area */}
      <div className="h-24 flex items-center px-4 border-b border-white/5 overflow-hidden">
        <div className={`flex items-center gap-4 transition-all duration-500 ${!isOpen && 'mx-auto'}`}>
          <div className="min-w-[44px] h-11 bg-[#c2a336] rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <span className="text-[#1a3a32] font-black text-xl">U</span>
          </div>
          {isOpen && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-4">
              <span className="text-[10px] font-black text-[#c2a336] uppercase tracking-[0.2em]">Judiciary Kenya</span>
              <span className="text-lg font-black uppercase tracking-tighter">Urithi Portal</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-8 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center rounded-xl text-[10px] font-black uppercase tracking-widest
              transition-all duration-300 group relative
              ${isOpen ? "px-5 py-3.5 gap-4" : "p-3.5 justify-center"}
              ${isActive ? "bg-[#c2a336] text-[#1a3a32] shadow-xl" : "text-emerald-100/50 hover:bg-white/5 hover:text-white"}
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            {isOpen && <span className="truncate">{item.name}</span>}
            
            {!isOpen && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#1a3a32] text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 bg-black/10">
        <div className={`flex items-center bg-white/5 rounded-xl border border-white/5 transition-all ${isOpen ? 'p-4' : 'p-3 justify-center'}`}>
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </div>
          {isOpen && <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-emerald-100/40">Secure Node</span>}
        </div>
      </div>
    </aside>
  );
};
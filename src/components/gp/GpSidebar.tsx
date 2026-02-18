import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LayoutDashboard, User, LogOut, Database, Pen } from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const menuItems: SidebarItem[] = [
  { name: "Dashboard", path: "/gp", icon: LayoutDashboard },
  { name: "Records", path: "/gp/records", icon: Database },
  { name: "Add Records", path: "/gp/form", icon: Pen },
  { name: "Profile", path: "/gp/profile", icon: User },
];

interface GpSidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export const GpSidebar: React.FC<GpSidebarProps> = ({ isOpen, toggle }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (err: unknown) {
      console.error("Logout failed:", err instanceof Error ? err.message : err);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-white flex flex-col transition-all
          ${isOpen ? "w-60" : "w-19 -translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div
          className={`h-28 flex items-center ${isOpen ? "px-8" : "justify-center"}`}
        >
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative min-w-[52px] h-[52px] bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-105">
                <span className="text-white font-black text-2xl tracking-tighter">
                  GP
                </span>
              </div>
            </div>
            {isOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
                  Medical Systems
                </span>
                <span className="text-xl font-black tracking-tight text-white/90">
                  Care<span className="text-emerald-500">Point</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggle()}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-2xl transition-all duration-300 ${
                    isOpen ? "px-5 py-4 gap-4" : "p-4 justify-center"
                  } ${isActive ? "bg-emerald-600/10 text-emerald-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-emerald-400" : ""}`}
                    />
                    {isOpen && (
                      <span
                        className={`text-[11px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                      >
                        {item.name}
                      </span>
                    )}
                    {!isOpen && (
                      <div className="absolute left-20 scale-0 group-hover:scale-100 transition-all origin-left bg-slate-800 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl z-[60] border border-white/10 whitespace-nowrap pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={`group relative flex items-center gap-4 w-full rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-300 ${
              isOpen ? "px-5 py-4" : "p-4 justify-center"
            }`}
          >
            <LogOut size={22} />
            {isOpen && <span>Terminate Session</span>}
            {!isOpen && (
              <div className="absolute left-20 scale-0 group-hover:scale-100 transition-all origin-left bg-rose-600 text-white text-[10px] px-4 py-2 rounded-xl shadow-2xl z-[60] whitespace-nowrap pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

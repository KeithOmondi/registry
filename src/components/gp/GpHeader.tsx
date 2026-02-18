import React from "react";
import { Menu, Bell, Search, Settings } from "lucide-react";
import { useAppSelector } from "../../store/hooks";

interface GpHeaderProps {
  toggleSidebar: () => void;
}

const GpHeader: React.FC<GpHeaderProps> = ({ toggleSidebar }) => {
  const user = useAppSelector((state) => state.user.currentUser);
  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "Medical Officer";
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "GP";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl w-64 group focus-within:ring-2 ring-emerald-500/20 transition-all">
          <Search
            size={16}
            className="text-slate-400 group-focus-within:text-emerald-500"
          />
          <input
            type="text"
            placeholder="Search patient records..."
            className="bg-transparent border-none text-[12px] font-medium focus:ring-0 placeholder:text-slate-400 w-full ml-3 text-slate-700"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <button className="hidden sm:flex p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all">
          <Settings size={20} />
        </button>

        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">
              {fullName}
            </p>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
              {user?.role || "Medical Personnel"}
            </p>
          </div>

          <div className="group relative w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg border-2 border-white ring-1 ring-slate-100 cursor-pointer hover:scale-105 transition-transform overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] font-black text-emerald-400 tracking-tighter">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default GpHeader;

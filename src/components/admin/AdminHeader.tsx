import React from "react";
import { useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { Loader2, LogOut, Menu } from "lucide-react";

interface AdminHeaderProps {
  userName: string;
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userName, onMenuClick }) => {
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-20 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg lg:bg-transparent transition-colors text-slate-600"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex flex-col">
          <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-tight">Administrative</h1>
          <p className="text-lg font-black text-[#1a3a32] uppercase tracking-tight leading-tight">Overview</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-3 text-right">
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-black text-[#1a3a32] uppercase leading-none">{userName}</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase mt-1">Super Admin</span>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-emerald-500/20 flex items-center justify-center font-black text-[#1a3a32] shadow-inner">
            {userName.charAt(0)}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />

        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex items-center gap-2 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-all border border-red-100 px-3 py-2 md:px-4 md:py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          <span className="hidden xs:inline">{isLoggingOut ? "Wait..." : "Sign Out"}</span>
        </button>
      </div>
    </header>
  );
};
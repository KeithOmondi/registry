import React from "react";
import { useAppDispatch } from "../../store/hooks"; // Ensure path is correct for your hooks
import { logout } from "../../store/slices/authSlice";
import { Loader2, LogOut } from "lucide-react";

interface AdminHeaderProps {
  userName: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userName }) => {
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      // Most routers will automatically redirect because the private route 
      // detects isAuthenticated is now false.
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-20 flex justify-between items-center shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Administrative</h1>
        <p className="text-lg font-black text-[#1a3a32] uppercase tracking-tight">Overview</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-right">
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#1a3a32] uppercase leading-none">{userName}</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Super Admin</span>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-emerald-500/20 flex items-center justify-center font-black text-[#1a3a32]">
            {userName.charAt(0)}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200" />

        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="group flex items-center gap-2 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-all border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
          )}
          {isLoggingOut ? "Processing..." : "Sign Out"}
        </button>
      </div>
    </header>
  );
};
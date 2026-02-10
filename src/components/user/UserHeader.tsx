import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, Bell } from "lucide-react";
import type { AppDispatch, RootState } from "../../store/store";
import { logout } from "../../store/slices/authSlice";

interface UserHeaderProps {
  toggleSidebar: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ toggleSidebar }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[50] px-6 lg:px-10">
      <div className="h-full flex justify-between items-center max-w-[1600px] mx-auto">
        
        {/* LEFT: Toggle & Context */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleSidebar}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-[#1a3a32]"
          >
            <Menu size={22} />
          </button>
          
          <div className="hidden md:block h-10 w-[1px] bg-slate-200" />
          
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black text-[#c2a336] uppercase tracking-[0.2em] mb-0.5">
              Principal Registry
            </span>
            <h2 className="text-sm font-black text-[#1a3a32] uppercase tracking-tight">
              Officer: {user?.firstName ? `${user.firstName} ${user.lastName}` : "Authenticated User"}
            </h2>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3">
          <button className="p-3 text-slate-400 hover:text-[#1a3a32] relative group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#c2a336] rounded-full ring-2 ring-white" />
          </button>
          
          <button 
            onClick={() => dispatch(logout()).then(() => navigate('/login'))}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3a32] text-[#c2a336] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#c2a336] hover:text-[#1a3a32] transition-all shadow-lg active:scale-95"
          >
            <LogOut size={14} />
            <span className="hidden lg:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
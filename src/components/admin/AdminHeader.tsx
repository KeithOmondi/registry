import React from "react";

interface AdminHeaderProps {
  userName: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userName }) => {
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

        <button className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50">
          Sign Out
        </button>
      </div>
    </header>
  );
};
import React from "react";

interface UserHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  userName,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Section: Judiciary Brand & User Greeting */}
          <div className="flex items-center gap-6">
            {/* Coat of Arms Placeholder - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-200 pr-6">
              <div className="h-12 w-auto">
                 {/* Replace with actual image: <img src="/kenya-coat-of-arms.png" className="h-full" alt="Republic of Kenya" /> */}
                 <div className="mb-4">
            <img
              src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
              alt="Registry Logo"
              className="h-15 w-auto object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")} // Hides if image not found
            />
            {/* Fallback Icon if logo is missing */}
            <div className="hidden only:block text-4xl text-[#1a3a32]">⚖️</div>
          </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] leading-none mb-1.5">
                Principal Registry • Judiciary
              </span>
              <h2 className="text-lg font-black text-[#1E4332] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                Welcome, {userName || "Officer"}
              </h2>
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <button className="relative p-2.5 text-slate-500 hover:text-[#1E4332] hover:bg-slate-100 rounded-full transition-all group">
              <span className="sr-only">Notifications</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Notification Badge in Judiciary Gold */}
              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-[#C5A059] ring-2 ring-white" />
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1" />

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-5 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 border border-slate-300 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg transition-all duration-200 shadow-sm active:scale-95"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
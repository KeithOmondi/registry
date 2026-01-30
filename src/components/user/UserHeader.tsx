import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { logout } from "../../store/slices/authSlice";

export const UserHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // ✅ AUTH SLICE IS SOURCE OF TRUTH
  const { user, status } = useSelector((state: RootState) => state.auth);

  const loading = status === "loading";

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-200 pr-6">
              <img
                src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
                alt="Judiciary Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.2em] leading-none mb-1.5">
                Principal Registry • Judiciary
              </span>

              <h2 className="text-lg font-black text-[#1E4332] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />

                {loading ? (
                  <span className="h-5 w-32 bg-slate-100 animate-pulse rounded-md" />
                ) : (
                  `Welcome, ${
                    user?.firstName
                      ? `${user.firstName} ${user.lastName}`
                      : "Officer"
                  }`
                )}
              </h2>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2.5 text-slate-500 hover:text-[#1E4332] hover:bg-slate-100 rounded-full transition-all group">
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

              <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-[#C5A059] ring-2 ring-white" />
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1" />

            <button
              onClick={handleLogout}
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

import React, { useState, type ReactNode } from "react";
import { useDispatch } from "react-redux"; // Added
import { useNavigate } from "react-router-dom"; // Added
import { UserSidebar } from "./UserSidebar";
import { UserHeader } from "./UserHeader";
import { logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store/store";

interface UserLayoutProps {
  children: ReactNode;
  userName?: string;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children, userName }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  /* =====================================
      LOGOUT HANDLER
  ===================================== */
  const handleLogout = async () => {
    try {
      // Dispatch the thunk to clear state and hit the API logout endpoint
      await dispatch(logout()).unwrap();
      // Redirect to the login page
      navigate("/login");
    } catch (error) {
      // Force navigation even if the API logout fails (session is dead locally)
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1EA]">
      <UserSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center bg-white sticky top-0 z-40 border-b border-slate-200 h-20 shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-4 text-[#1E4332] lg:hidden hover:bg-slate-50"
            aria-label="Open Menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1">
            {/* Pass the userName and the logout handler to the Header */}
            <UserHeader userName={userName} onLogout={handleLogout} />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
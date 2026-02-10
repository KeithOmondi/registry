import React, { useState } from "react";
import { UserSidebar } from "./UserSidebar";
import { UserHeader } from "./UserHeader";

export const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Sidebar - Always Rendered */}
      <UserSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area: Padding dynamically adjusts based on sidebar width */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-500 ease-in-out ${
          sidebarOpen ? "lg:pl-72" : "lg:pl-20"
        }`}
      >
        <UserHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
        
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm z-[55] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
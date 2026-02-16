import { useState } from "react";
import { Outlet } from "react-router-dom";
import GpHeader from "./GpHeader";
import { GpSidebar } from "./GpSidebar";

const GpLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    // TODO: connect to Redux logout or auth logic
    console.log("Logging out...");
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* Sidebar */}
      <GpSidebar
        isOpen={isSidebarOpen}
        toggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <GpHeader toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default GpLayout;

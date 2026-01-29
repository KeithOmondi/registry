import React from "react";

interface AdminHeaderProps {
  userName: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userName }) => {
  return (
    <header className="bg-gray-800 text-white flex justify-between items-center px-6 h-16 shadow-md">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        <span>Welcome, {userName}</span>
        <button className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
          Logout
        </button>
      </div>
    </header>
  );
};

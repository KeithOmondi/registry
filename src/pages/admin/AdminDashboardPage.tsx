import React from "react";

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-gray-600 text-sm">Total Records</h2>
          <p className="text-3xl font-bold">1024</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-gray-600 text-sm">Approved Records</h2>
          <p className="text-3xl font-bold">900</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-gray-600 text-sm">Rejected Records</h2>
          <p className="text-3xl font-bold">124</p>
        </div>
      </div>
    </div>
  );
};

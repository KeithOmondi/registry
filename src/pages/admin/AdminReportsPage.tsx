import React from "react";

export const AdminReportsPage: React.FC = () => {
  const months = ["January", "February", "March", "April"];
  const recordsCount = [12, 15, 9, 20];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Monthly Reports</h1>

      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Month</th>
            <th className="px-4 py-2 text-left">Records Count</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m, i) => (
            <tr key={m} className="border-t">
              <td className="px-4 py-2">{m}</td>
              <td className="px-4 py-2">{recordsCount[i]}</td>
              <td className="px-4 py-2">
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                  View
                </button>
                <button className="px-3 py-1 bg-green-500 text-white rounded text-sm ml-2">
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

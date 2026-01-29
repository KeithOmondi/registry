import React, { useState } from "react";

export const AdminRecordsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const records = [
    { id: 1, causeNo: "F123/2026", deceased: "John Doe", court: "High Court" },
    { id: 2, causeNo: "F124/2026", deceased: "Mary Jane", court: "Law Courts" },
  ];

  const filtered = records.filter(
    (r) =>
      r.causeNo.toLowerCase().includes(search.toLowerCase()) ||
      r.deceased.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Records</h1>
      <input
        type="text"
        placeholder="Search by Cause No or Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 mb-4 border rounded w-full md:w-1/3"
      />
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Cause No</th>
            <th className="px-4 py-2 text-left">Deceased</th>
            <th className="px-4 py-2 text-left">Court</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-4 py-2">{r.causeNo}</td>
              <td className="px-4 py-2">{r.deceased}</td>
              <td className="px-4 py-2">{r.court}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

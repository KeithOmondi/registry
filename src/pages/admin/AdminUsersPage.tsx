import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchAllUsers, toggleUserStatus } from "../../store/slices/userSlice";

export const AdminUsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.user,
  );

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleToggleStatus = (userId: string) => {
    dispatch(toggleUserStatus(userId));
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6]">
        <div className="animate-pulse text-sm font-black text-[#1a3a32] uppercase tracking-[0.2em]">
          Loading Registry Personnel...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#f4f7f6] min-h-screen">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1a3a32] tracking-tight uppercase">
            User Management
          </h2>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em] mt-1">
            Registry Access & Permission Control
          </p>
        </div>
        <button className="bg-[#b48222] hover:bg-[#966d1c] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">
          + Add New Officer
        </button>
      </div>

      {error && (
        <div className="max-w-[1400px] mx-auto mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase">
          ⚠️ System Error: {error}
        </div>
      )}

      {/* Main Table Container */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a3a32] text-white">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Full Name
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-60">
                  Contact Email
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-60 text-center">
                  System Role
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-60 text-center">
                  Access Status
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-5">
                    <span className="block text-sm font-black text-[#1a3a32] uppercase">
                      {u.firstName} {u.lastName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      ID: {u._id.slice(-8)}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-xs text-slate-600">
                    {u.email || "N/A"}
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-mono font-black border ${
                        u.role === "Admin"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        u.isActive
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {u.isActive ? "● Authorized" : "○ Suspended"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button className="text-[10px] font-black text-slate-400 hover:text-[#1a3a32] uppercase tracking-widest transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`text-[10px] font-black uppercase tracking-widest ${u.isActive ? "text-orange-500 hover:text-orange-700" : "text-emerald-500 hover:text-emerald-700"}`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button className="text-[10px] font-black text-red-400 hover:text-red-700 uppercase tracking-widest">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Registry Database is Empty
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

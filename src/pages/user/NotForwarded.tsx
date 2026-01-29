import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import {
  fetchRecords,
  updateMultipleRecordsDateForwarded,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const NotForwardedPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux State
  const { records = [], loading } = useSelector(
    (state: RootState) => state.records,
  );
  const { courts = [] } = useSelector((state: RootState) => state.courts);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [courtFilter, setCourtFilter] = useState("");

  // Bulk Action States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDate, setBulkDate] = useState("");

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

  /* =========================
      FILTER & SEARCH LOGIC
  ========================= */
  const pendingRecords = useMemo(() => {
    let result = records.filter((r) => !r.dateForwardedToGP);

    if (courtFilter && courtFilter !== "all") {
      result = result.filter((r) => r.courtStation?._id === courtFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.nameOfDeceased?.toLowerCase().includes(lowerSearch) ||
          r.causeNo?.toLowerCase().includes(lowerSearch) ||
          r.courtStation?.name?.toLowerCase().includes(lowerSearch),
      );
    }

    return result.sort((a, b) => (b.no || 0) - (a.no || 0));
  }, [records, courtFilter, searchTerm]);

  // Bulk Selection
  const toggleSelectAll = () => {
    const visibleIds = pendingRecords.map((r) => r._id!).filter(Boolean);
    setSelectedIds(selectedIds.length === visibleIds.length ? [] : visibleIds);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkUpdate = async () => {
    if (!bulkDate) return toast.error("⚠️ Please select a date");
    if (!selectedIds.length) return toast.error("⚠️ No records selected");

    try {
      await dispatch(
        updateMultipleRecordsDateForwarded({
          ids: selectedIds,
          date: bulkDate,
        }),
      ).unwrap();
      toast.success(`✅ Successfully forwarded ${selectedIds.length} records`);
      setSelectedIds([]);
      setBulkDate("");
    } catch (err: any) {
      toast.error(err || "Failed to update records");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#f4f7f6] min-h-screen">
      <Toaster position="top-right" />

      {/* NEW LOGO & HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto mb-10">
        <div className="flex flex-col items-center md:items-start">
          {/* Logo Placeholder - Replace /logo.png with your actual path */}
          <div className="mb-4">
            <img
              src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
              alt="Registry Logo"
              className="h-20 w-auto object-contain"
              onError={(e) => (e.currentTarget.style.display = "none")} // Hides if image not found
            />
            {/* Fallback Icon if logo is missing */}
            <div className="hidden only:block text-4xl text-[#1a3a32]">⚖️</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end w-full gap-4">
            <div>
              <h2 className="text-3xl font-black text-[#1a3a32] tracking-tight uppercase">
                Forwarding Queue
              </h2>
              {/* The Small Red Line / Compliance Text */}
              <div className="flex items-center gap-2 mt-1">
                <div className="h-[2px] w-8 bg-red-500"></div>
                <p className="text-red-500 font-bold uppercase text-[10px] tracking-widest">
                  {pendingRecords.length} Items Awaiting Dispatch to GP
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto no-print">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, cause, or station..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none shadow-sm focus:border-emerald-500 transition-all"
                />
                <span className="absolute left-3.5 top-3 opacity-30 text-lg">
                  🔍
                </span>
              </div>

              <select
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none shadow-sm cursor-pointer"
              >
                <option value="all">All Stations</option>
                {courts.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="max-w-[1600px] mx-auto mb-6 bg-[#1a3a32] p-4 rounded-2xl shadow-xl text-white flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 border-r border-white/10 pr-6">
            <span className="bg-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {selectedIds.length} Selected
            </span>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <label className="text-xs font-bold uppercase opacity-60">
              Set Forwarded Date:
            </label>
            <input
              type="date"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none focus:bg-white focus:text-black transition-all"
            />
            <button
              onClick={handleBulkUpdate}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Update Selection
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="max-w-[1600px] mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === pendingRecords.length &&
                      pendingRecords.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#1a3a32]"
                  />
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Station
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Cause No
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Deceased
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Date Received
                </th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Form 60
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingRecords.length > 0 ? (
                pendingRecords.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r._id!)}
                        onChange={() => toggleSelect(r._id!)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        {r.courtStation?.name}
                      </span>
                    </td>
                    <td className="p-5 font-mono text-[11px] font-black text-slate-400">
                      {r.causeNo}
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-black text-[#1a3a32] uppercase">
                        {r.nameOfDeceased}
                      </span>
                    </td>
                    <td className="p-5 text-center text-xs text-slate-500 font-medium">
                      {r.dateReceived?.split("T")[0]}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${r.form60Compliance === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
                      >
                        {r.form60Compliance ?? "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <span className="text-5xl mb-4">📂</span>
                      <p className="font-black uppercase tracking-[0.2em] text-slate-400">
                        All caught up!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotForwardedPage;

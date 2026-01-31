import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import  { Toaster } from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reportRef = useRef<HTMLDivElement>(null);

  const { records = [] } = useSelector((state: RootState) => state.records);
  const { courts = [] } = useSelector((state: RootState) => state.courts);

  // Filters
  const [courtFilter, setCourtFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all"); // Approved | Rejected
  const [gpStatusFilter, setGpStatusFilter] = useState("all"); // Not Forwarded
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

  /* ========================
      STRICT FILTER LOGIC
  ======================== */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Station Filter
      const matchesCourt = courtFilter === "all" || r.courtStation?._id === courtFilter;

      // 2. Compliance Filter (Approved / Rejected)
      const matchesCompliance = complianceFilter === "all" || r.form60Compliance === complianceFilter;

      // 3. GP Forwarding Status (Strictly checks if DateForwarded exists)
      const matchesGP = gpStatusFilter === "all" || 
        (gpStatusFilter === "Not Forwarded" && !r.dateForwardedToGP);

      // 4. Date Range
      const recordDate = r.dateReceived ? new Date(r.dateReceived) : null;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const matchesDate = (!start || (recordDate && recordDate >= start)) &&
                          (!end || (recordDate && recordDate <= end));

      return matchesCourt && matchesCompliance && matchesGP && matchesDate;
    }).sort((a, b) => (b.no || 0) - (a.no || 0));
  }, [records, courtFilter, complianceFilter, gpStatusFilter, startDate, endDate]);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `ORHC_Report_${complianceFilter}_${gpStatusFilter}`,
  });

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Report Generator</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Generate filtered station records</p>
        </div>
        
        <button
          onClick={() => handlePrint()}
          disabled={filteredRecords.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          Download PDF ({filteredRecords.length} Results)
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 no-print bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        
        {/* 1. Court Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Select Station</label>
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500/20"
          >
            <option value="all">All Courts</option>
            {courts.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* 2. Compliance Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Compliance</label>
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className={`rounded-xl px-4 py-3 text-sm font-black outline-none border-none ring-2 ring-transparent focus:ring-emerald-500/20 ${
              complianceFilter === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
              complianceFilter === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-700'
            }`}
          >
            <option value="all">All Compliance</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* 3. GP Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">GP Forwarding</label>
          <select
            value={gpStatusFilter}
            onChange={(e) => setGpStatusFilter(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500/20"
          >
            <option value="all">All Progress</option>
            <option value="Not Forwarded">Not Yet Forwarded</option>
          </select>
        </div>

        {/* 4. Date Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-emerald-500/20"
          />
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setCourtFilter("all");
            setComplianceFilter("all");
            setGpStatusFilter("all");
            setStartDate("");
            setEndDate("");
          }}
          className="mt-auto py-3 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* PRINTABLE CONTENT */}
      <div ref={reportRef} className="max-w-[1600px] mx-auto print:p-8">
        {/* Header (Print only) */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-black uppercase text-slate-900">Official Registry Report</h1>
          <div className="grid grid-cols-3 mt-4 text-[10px] font-bold uppercase text-slate-600">
            <p>Station: {courts.find(c => c._id === courtFilter)?.name || "All Stations"}</p>
            <p>Status: {complianceFilter} | {gpStatusFilter}</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-black">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Station</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Deceased Name</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Cause No</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Compliance</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest">Date Forwarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition-colors page-break-inside-avoid">
                    <td className="p-5 text-[11px] font-bold text-slate-700 uppercase">{r.courtStation?.name}</td>
                    <td className="p-5 text-xs font-black text-slate-900 uppercase">{r.nameOfDeceased}</td>
                    <td className="p-5 font-mono text-[11px] text-slate-500">{r.causeNo}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                        r.form60Compliance === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {r.form60Compliance}
                      </span>
                    </td>
                    <td className="p-5 text-[11px] font-bold text-slate-500">
                      {r.dateForwardedToGP ? r.dateForwardedToGP.split('T')[0] : <span className="text-orange-500 uppercase">Pending GP</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase text-sm tracking-widest">
                    No records match your current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { size: landscape; margin: 0.5in; }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
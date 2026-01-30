import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import toast, { Toaster } from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reportRef = useRef<HTMLDivElement>(null);

  // Redux state
  const { records = [], error } = useSelector(
    (state: RootState) => state.records
  );
  const { courts = [] } = useSelector((state: RootState) => state.courts);

  // UI states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  /* ========================
     FILTERED RECORDS
  ======================== */
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // Search by court name
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((r) =>
        r.courtStation?.name?.toLowerCase().includes(lower)
      );
    }

    // Filter by court ID
    if (courtFilter && courtFilter !== "all") {
      result = result.filter((r) => r.courtStation?._id === courtFilter);
    }

    // Date range filter
    if (startDate || endDate) {
      result = result.filter((r) => {
        const recordDate = r.dateReceived ? new Date(r.dateReceived) : null;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (
          (!start || (recordDate && recordDate >= start)) &&
          (!end || (recordDate && recordDate <= end))
        );
      });
    }

    // Sort newest first
    return result.sort((a, b) => (b.no || 0) - (a.no || 0));
  }, [records, searchTerm, courtFilter, startDate, endDate]);

  /* ========================
     COMPUTE FILTERED STATS
  ======================== */
  const filteredStats = useMemo(() => {
    const total = filteredRecords.length;
    const approved = filteredRecords.filter((r) => r.form60Compliance === "Approved").length;
    const rejected = filteredRecords.filter((r) => r.form60Compliance === "Rejected").length;
    const pending = filteredRecords.filter((r) => r.statusAtGP === "Pending").length;
    const published = filteredRecords.filter((r) => r.statusAtGP === "Published").length;
    const recLeadTimes = filteredRecords
      .map((r) => r.receivingLeadTime ?? 0)
      .filter((v) => v > 0);
    const fwdLeadTimes = filteredRecords
      .map((r) => r.forwardingLeadTime ?? 0)
      .filter((v) => v > 0);
    const avgRec = recLeadTimes.length
      ? recLeadTimes.reduce((a, b) => a + b, 0) / recLeadTimes.length
      : 0;
    const avgFwd = fwdLeadTimes.length
      ? fwdLeadTimes.reduce((a, b) => a + b, 0) / fwdLeadTimes.length
      : 0;
    const kpiBreaches = filteredRecords.filter((r) => (r.forwardingLeadTime ?? 0) > 30).length;

    return {
      total,
      compliance: { approved, rejected },
      gpStatus: { pending, published },
      averages: { receivingLeadTime: avgRec, forwardingLeadTime: avgFwd },
      kpiBreaches,
    };
  }, [filteredRecords]);

  /* ========================
     PRINT HANDLER
  ======================== */
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Registry_Report_${new Date().toISOString().split("T")[0]}`,
  });

  const toggleSelectAll = () => {
    const visibleIds = filteredRecords.map((r) => r._id!).filter(Boolean);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  return (
    <div className="p-4 md:p-8 bg-[#f4f7f6] min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-col md:flex-row justify-between items-end gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black text-[#1a3a32] uppercase tracking-tight">
            ORHC Urithi Official Reports
          </h2>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-1">
            Compliance & Lead-Time Analytics
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-[#1a3a32] hover:bg-emerald-900 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
        >
          Export PDF Report ({filteredRecords.length})
        </button>
      </div>

      {/* FILTERS */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 no-print">
        <input
          type="text"
          placeholder="Search by Court Station Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
        />
        <select
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm cursor-pointer outline-none"
        >
          <option value="all">All Stations (ID Filter)</option>
          {courts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 mb-1 ml-2 uppercase">
            From Date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm shadow-sm outline-none"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 mb-1 ml-2 uppercase">
            To Date
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm shadow-sm outline-none"
          />
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setCourtFilter("");
            setStartDate("");
            setEndDate("");
          }}
          className="bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-auto h-[48px]"
        >
          Reset View
        </button>
      </div>

      {/* STATS SUMMARY */}
      <div className="max-w-[1600px] mx-auto mb-4 no-print bg-white p-4 rounded-2xl shadow">
        <p className="text-sm font-bold">
          Total Records: {filteredStats.total} |{" "}
          Approved: {filteredStats.compliance.approved} |{" "}
          Rejected: {filteredStats.compliance.rejected} |{" "}
          Pending: {filteredStats.gpStatus.pending} |{" "}
          Published: {filteredStats.gpStatus.published} |{" "}
          Avg Rec. Lead: {filteredStats.averages.receivingLeadTime.toFixed(1)}d |{" "}
          Avg Fwd. Lead: {filteredStats.averages.forwardingLeadTime.toFixed(1)}d |{" "}
          KPI Breaches: {filteredStats.kpiBreaches}
        </p>
      </div>

      {/* PRINTABLE AREA */}
      <div ref={reportRef} className="max-w-[1600px] mx-auto print:m-0 print:p-0">
        {/* Printable Header */}
        <div className="hidden print:flex flex-col items-center mb-10 text-center border-b pb-6">
          <img
            src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
            alt="Registry Logo"
            className="h-20 w-auto object-contain mb-4"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <h1 className="text-2xl font-black text-[#1a3a32] uppercase">
            ORHC Compliance Report
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-slate-300 print:rounded-none">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse min-w-[1600px] print:min-w-full">
              <thead>
                <tr className="bg-[#1a3a32] text-white print:bg-slate-50 print:text-black">
                  <th className="p-4 w-12 text-center no-print">
                    <input type="checkbox" onChange={toggleSelectAll} className="w-4 h-4" />
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Station</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Cause No</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest">Name of Deceased</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-red-400">Rejection Reason</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Date Received</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">E-Citizen Date</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Rec. Lead Time</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Forwarded</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Fwd. Lead Time</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Form 60 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 page-break-inside-avoid">
                    <td className="p-4 text-center no-print">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r._id!)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(r._id!) ? prev.filter((x) => x !== r._id) : [...prev, r._id!]
                          )
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                    </td>
                    <td className="p-4 text-[11px] font-bold text-slate-700 uppercase">{r.courtStation?.name ?? "-"}</td>
                    <td className="p-4 font-mono text-[11px] font-black text-slate-500">{r.causeNo ?? "-"}</td>
                    <td className="p-4 text-xs font-black text-[#1a3a32] uppercase">{r.nameOfDeceased ?? "-"}</td>
                    <td className="p-4 text-[10px] font-bold uppercase">
                      {r.rejectionReason ? (
                        <span className="text-red-500">{r.rejectionReason}</span>
                      ) : (
                        <span className="text-slate-300 italic">None Recorded</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-[11px] text-slate-500">{r.dateReceived?.split("T")[0] ?? "-"}</td>
                    <td className="p-4 text-center text-[11px] text-slate-500">{r.dateOfReceipt?.split("T")[0] ?? "-"}</td>
                    <td className={`p-4 text-center font-black text-[11px] ${(r.receivingLeadTime ?? 0) > 30 ? "text-red-600" : "text-slate-400"}`}>{r.receivingLeadTime ?? 0}d</td>
                    <td className="p-4 text-center text-[11px] font-bold text-emerald-700">{r.dateForwardedToGP?.split("T")[0] ?? "PENDING"}</td>
                    <td className={`p-4 text-center font-black text-[11px] ${(r.forwardingLeadTime ?? 0) > 30 ? "text-red-600" : "text-slate-400"}`}>{r.forwardingLeadTime ?? 0}d</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${r.form60Compliance === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                        {r.form60Compliance ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          .overflow-x-auto { overflow: visible !important; display: block !important; }
          table { width: 100% !important; table-layout: auto !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          @page { size: landscape; margin: 1cm; }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;

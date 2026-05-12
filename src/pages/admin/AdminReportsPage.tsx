import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import QRCode from "react-qr-code";
import { Toaster } from "react-hot-toast";

import {
  Printer,
  Filter,
  RotateCcw,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  LayoutDashboard,
  FileSearch,
} from "lucide-react";

import type { AppDispatch, RootState } from "../../store/store";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const AdminReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reportRef = useRef<HTMLDivElement>(null);

  const { records = [], loading } = useSelector((state: RootState) => state.records);
  const { courts = [] } = useSelector((state: RootState) => state.courts);

  const [courtFilter, setCourtFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [gpStatusFilter, setGpStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");

  /**
   * FIX: "Impure function during render"
   * Initializing state with a function ensures Math.random() only runs once
   * during the initial mount, keeping re-renders predictable.
   */
  const [reportId] = useState(() => 
    `ORHC-ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

  /* =======================
      HELPERS
  ======================== */
  /**
   * FIX: Replaced 'any' with explicit types to satisfy ESLint
   */
  const renderLeadTime = (value: string | number | null | undefined) => {
    if (typeof value === 'number') return `${value}d`;
    if (typeof value === 'string' && value !== "" && !isNaN(Number(value))) {
      return `${value}d`;
    }
    return "--";
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0];
  };

  /* =======================
      FILTER LOGIC
  ======================== */
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesCourt = courtFilter === "all" || r.courtStation?._id === courtFilter;
        const matchesCompliance = complianceFilter === "all" || r.form60Compliance === complianceFilter;
        const matchesGP = gpStatusFilter === "all" || 
                          (gpStatusFilter === "Forwarded" && r.dateForwardedToGP) || 
                          (gpStatusFilter === "Not Forwarded" && !r.dateForwardedToGP);
        const recordDate = r.dateReceived ? new Date(r.dateReceived) : null;
        const start = startDate ? new Date(startDate) : null;

        return matchesCourt && matchesCompliance && matchesGP && (!start || (recordDate && recordDate >= start));
      })
      .sort((a, b) => (Number(b.no) || 0) - (Number(a.no) || 0));
  }, [records, courtFilter, complianceFilter, gpStatusFilter, startDate]);

  const stats = useMemo(() => ({
    total: filteredRecords.length,
    approved: filteredRecords.filter((r) => r.form60Compliance === "Approved").length,
    rejected: filteredRecords.filter((r) => r.form60Compliance === "Rejected").length,
    pendingGP: filteredRecords.filter((r) => !r.dateForwardedToGP).length,
  }), [filteredRecords]);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: reportId,
  });

  return (
    <div className="p-6 md:p-10 bg-[#F4F7F6] min-h-screen font-sans text-slate-900">
      <Toaster position="top-right" />

      {/* WEB UI HEADER */}
      <div className="max-w-[1600px] mx-auto no-print mb-10">
        <div className="flex justify-between items-start md:items-center flex-wrap gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Admin Report Center</h1>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Probate Registry Compliance & Audit Management</p>
          </div>

          <button
            onClick={() => handlePrint()}
            disabled={!filteredRecords.length}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all duration-300"
          >
            <Printer size={18} className="group-hover:scale-110 transition-transform" />
            Generate PDF Document
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 no-print">
        {[
          { label: "Total Records", val: stats.total, icon: <FileText />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Compliance Approved", val: stats.approved, icon: <ShieldCheck />, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Compliance Rejected", val: stats.rejected, icon: <ShieldAlert />, color: "text-red-600", bg: "bg-red-50" },
          { label: "Pending Forwarding", val: stats.pendingGP, icon: <Clock />, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
            <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>{s.icon}</div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{s.label}</span>
              <p className="text-2xl font-black text-slate-800">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="max-w-[1600px] mx-auto bg-white/80 backdrop-blur-md sticky top-6 z-20 border border-slate-200 p-4 rounded-[2.5rem] shadow-xl flex flex-wrap gap-4 items-center mb-12 no-print">
        <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-200">
          <Filter size={16} className="text-emerald-600" />
          <span className="text-[10px] font-black uppercase text-slate-400">Filters</span>
        </div>
        <select value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)} className="flex-1 min-w-[180px] bg-transparent text-sm font-bold p-2 outline-none">
          <option value="all">All Court Stations</option>
          {courts.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={complianceFilter} onChange={(e) => setComplianceFilter(e.target.value)} className="flex-1 min-w-[150px] bg-transparent text-sm font-bold p-2 outline-none">
          <option value="all">Compliance Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={gpStatusFilter} onChange={(e) => setGpStatusFilter(e.target.value)} className="flex-1 min-w-[150px] bg-transparent text-sm font-bold p-2 outline-none">
          <option value="all">GP Status (All)</option>
          <option value="Forwarded">Forwarded</option>
          <option value="Not Forwarded">Not Forwarded</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 min-w-[150px] bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />
        <button onClick={() => { setCourtFilter("all"); setComplianceFilter("all"); setGpStatusFilter("all"); setStartDate(""); }} className="p-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"><RotateCcw size={18} /></button>
      </div>

      {/* SCROLLABLE CONTAINER */}
      <div className="max-w-[1600px] mx-auto overflow-x-auto rounded-[2rem] shadow-2xl bg-white no-scrollbar">
        <div ref={reportRef} className="p-10 print-container relative min-w-[1400px]">
          {/* WATERMARK */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-45 z-0">
            <h1 className="text-[12rem] font-black border-[12px] border-slate-900 px-10">ADMIN COPY</h1>
          </div>

          <div className="relative z-10">
            {/* REPORT HEADER */}
            <div className="flex items-center justify-between border-b-[6px] border-slate-900 pb-8 mb-8">
              <div className="flex items-center gap-8">
                <img src="https://res.cloudinary.com/do0yflasl/image/upload/v1770035125/JOB_LOGO_qep9lj.jpg" alt="Logo" className="h-28 w-auto" />
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase">Office of the Registrar High Court</h1>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em]">Republic of Kenya | The Judiciary</p>
                  <p className="text-[10px] font-black text-emerald-800 uppercase bg-emerald-50 w-fit px-4 py-1.5 rounded-md mt-4">Registry Compliance Audit Extract</p>
                </div>
              </div>
              <div className="text-right">
                <QRCode size={65} value={`https://urithi.vercel.app/verify/${reportId}`} />
                <span className="text-[8px] font-mono font-bold text-slate-400 block mt-2 tracking-tighter">ID: {reportId}</span>
              </div>
            </div>

            {/* MAIN DATA TABLE */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-black">
                  <th className="p-3 text-[8px] font-black uppercase text-left sticky left-0 bg-slate-900 z-10 print:bg-slate-100 w-[10%]">Station</th>
                  <th className="p-3 text-[8px] font-black uppercase text-left w-[8%]">Cause No</th>
                  <th className="p-3 text-[8px] font-black uppercase text-left w-[14%]">Name of Deceased</th>
                  <th className="p-3 text-[8px] font-black uppercase text-left text-red-400 print:text-red-600 w-[12%]">Rejection Reason</th>
                  <th className="p-3 text-[8px] font-black uppercase text-left w-[8%]">Received</th>
                  <th className="p-3 text-[8px] font-black uppercase text-left w-[8%]">E-Citizen</th>
                  <th className="p-3 text-[8px] font-black uppercase text-center w-[7%]">Rec. Lead</th>
                  <th className="p-3 text-[8px] font-black uppercase text-left w-[8%]">Forwarded</th>
                  <th className="p-3 text-[8px] font-black uppercase text-center w-[7%]">Fwd. Lead</th>
                  <th className="p-3 text-[8px] font-black uppercase text-right w-[10%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r._id} className="page-break-inside-avoid hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-[8px] font-bold text-slate-600 uppercase sticky left-0 bg-white group-hover:bg-slate-50 z-10">{r.courtStation?.name}</td>
                    <td className="p-3 font-mono text-[8px] text-blue-600 font-bold">{r.causeNo}</td>
                    <td className="p-3 text-[8px] font-black text-slate-900 uppercase leading-tight">{r.nameOfDeceased}</td>
                    <td className="p-3 text-[7px] font-bold text-slate-400 italic uppercase">
                      {r.rejectionReason || <span className="opacity-20">---</span>}
                    </td>
                    <td className="p-3 text-[8px] text-slate-500 font-medium">{formatDate(r.dateReceived)}</td>
                    <td className="p-3 text-[8px] text-slate-500 font-medium">{formatDate(r.dateOfReceipt)}</td>
                    <td className="p-3 text-[9px] font-black text-center text-slate-800">{renderLeadTime(r.receivingLeadTime)}</td>
                    <td className="p-3 text-[8px] font-bold text-emerald-600 uppercase">
                      {r.dateForwardedToGP ? formatDate(r.dateForwardedToGP) : <span className="text-amber-500">Pending</span>}
                    </td>
                    <td className="p-3 text-[9px] font-black text-center text-slate-800">{renderLeadTime(r.forwardingLeadTime)}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border ${
                        r.form60Compliance === "Approved" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        {r.form60Compliance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {filteredRecords.length === 0 && !loading && (
              <div className="flex flex-col items-center py-20 opacity-20">
                <FileSearch size={60} />
                <p className="text-xs font-black uppercase tracking-widest mt-4">No Records Matching Criteria</p>
              </div>
            )}

            {/* FOOTER */}
            <div className="mt-16 flex justify-between items-end border-t border-slate-200 pt-8">
              <div className="max-w-xs">
                <p className="text-[7px] text-slate-400 leading-relaxed uppercase font-bold italic">
                  Administrative Extract: This document is an authorized system audit from the URITHI Registry. 
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}.
                </p>
              </div>
              <div className="text-right">
                <div className="relative mb-2">
                  <p className="signature-font text-3xl text-blue-900 opacity-60 absolute -top-8 right-2">Hon. Registrar</p>
                  <div className="h-px w-56 bg-slate-900 ml-auto"></div>
                </div>
                <p className="text-[9px] font-black uppercase text-slate-900">Registrar, High Court of Kenya</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Digital Audit Signature Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap');
        .signature-font { font-family: 'Mrs Saint Delafield', cursive; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          @page { size: landscape; margin: 5mm; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            min-width: 100% !important; 
            padding: 0 !important;
          }
          .sticky { position: static !important; background: transparent !important; }
          table { width: 100% !important; }
          th, td { font-size: 7px !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminReportsPage;
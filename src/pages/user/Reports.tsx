import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { Toaster } from "react-hot-toast";
import { 
  FileText, 
  Filter, 
  Printer, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  LayoutDashboard 
} from "lucide-react";

import type { AppDispatch, RootState } from "../../store/store";
import { fetchRecords } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const ReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const reportRef = useRef<HTMLDivElement>(null);

  const { records = [] } = useSelector((state: RootState) => state.records);
  const { courts = [] } = useSelector((state: RootState) => state.courts);

  const [courtFilter, setCourtFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [gpStatusFilter, setGpStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesCourt = courtFilter === "all" || r.courtStation?._id === courtFilter;
      const matchesCompliance = complianceFilter === "all" || r.form60Compliance === complianceFilter;
      // Fixed: logic to handle gpStatusFilter
      const matchesGP = gpStatusFilter === "all" || 
                        (gpStatusFilter === "Not Forwarded" && !r.dateForwardedToGP) ||
                        (gpStatusFilter === "Forwarded" && r.dateForwardedToGP);
      
      const recordDate = r.dateReceived ? new Date(r.dateReceived) : null;
      const start = startDate ? new Date(startDate) : null;
      return (!start || (recordDate && recordDate >= start)) && matchesCourt && matchesCompliance && matchesGP;
    }).sort((a, b) => (b.no || 0) - (a.no || 0));
  }, [records, courtFilter, complianceFilter, gpStatusFilter, startDate]);

  const stats = useMemo(() => ({
    total: filteredRecords.length,
    approved: filteredRecords.filter(r => r.form60Compliance === 'Approved').length,
    rejected: filteredRecords.filter(r => r.form60Compliance === 'Rejected').length,
    pendingGP: filteredRecords.filter(r => !r.dateForwardedToGP).length
  }), [filteredRecords]);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `ORHC_Report_${new Date().toISOString().split('T')[0]}`,
  });

  return (
    <div className="p-6 md:p-10 bg-[#F4F7F6] min-h-screen font-sans text-slate-900">
      <Toaster position="top-right" />

      {/* WEB UI VIEW */}
      <div className="max-w-[1400px] mx-auto no-print">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-600 rounded-lg text-white">
                <LayoutDashboard size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight uppercase">Report Center</h2>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] ml-1">
              Probate Registry Analytics & Official Documentation
            </p>
          </div>
          
          <button
            onClick={() => handlePrint()}
            disabled={filteredRecords.length === 0}
            className="group flex items-center gap-3 bg-slate-900 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all duration-300"
          >
            <Printer size={18} className="group-hover:scale-110 transition-transform" />
            Generate PDF Document
          </button>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Filtered", val: stats.total, icon: <FileText />, color: "text-blue-600", bg: "bg-blue-50" },
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
        <div className="bg-white/80 backdrop-blur-md sticky top-6 z-20 border border-slate-200 p-4 rounded-[2.5rem] shadow-xl flex flex-wrap gap-4 items-center mb-12">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-slate-200">
            <Filter size={16} className="text-emerald-600" />
            <span className="text-[10px] font-black uppercase text-slate-400">Filters</span>
          </div>

          <select value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)} className="flex-1 min-w-[180px] bg-transparent text-sm font-bold p-2 outline-none cursor-pointer">
            <option value="all">All Court Stations</option>
            {courts.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select value={complianceFilter} onChange={(e) => setComplianceFilter(e.target.value)} className="flex-1 min-w-[150px] bg-transparent text-sm font-bold p-2 outline-none cursor-pointer">
            <option value="all">Compliance Status</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Added GP Status Filter to solve ts(6133) */}
          <select value={gpStatusFilter} onChange={(e) => setGpStatusFilter(e.target.value)} className="flex-1 min-w-[150px] bg-transparent text-sm font-bold p-2 outline-none cursor-pointer">
            <option value="all">GP Status (All)</option>
            <option value="Forwarded">Forwarded</option>
            <option value="Not Forwarded">Not Forwarded</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 min-w-[150px] bg-slate-50 rounded-xl px-4 py-2 text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all" />

          <button onClick={() => { setCourtFilter("all"); setComplianceFilter("all"); setGpStatusFilter("all"); setStartDate(""); }} className="p-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all" title="Reset Filters">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* PRINTABLE DOCUMENT */}
      <div className="max-w-[1200px] mx-auto overflow-hidden print:p-0">
        <div ref={reportRef} className="bg-white p-10 print-container">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <td colSpan={5}>
                  <div className="flex items-center gap-8 border-b-[6px] border-slate-900 pb-8 mb-8">
                    <img src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png" alt="Logo" className="h-28 w-auto print:grayscale-0" />
                    <div className="flex-1">
                      <h1 className="text-1xl font-black text-slate-900 leading-tight uppercase">Office of the Registrar High Court</h1>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="h-px bg-slate-300 flex-1"></span>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em]">Republic of Kenya</p>
                        <span className="h-px bg-slate-300 flex-1"></span>
                      </div>
                      <p className="text-xs font-black text-emerald-800 uppercase bg-emerald-50 w-fit px-4 py-1.5 rounded-md mt-4">Official Compliance Report</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hidden print:table-row">
                <td colSpan={5}>
                  <div className="grid grid-cols-3 bg-slate-100 p-6 rounded-2xl mb-8 border border-slate-200">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Ref No.</span>
                      <p className="text-xs font-mono font-bold tracking-tighter">ORHC-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                    </div>
                    <div className="text-center border-x border-slate-200">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Filter Start</span>
                      <p className="text-xs font-bold">{startDate || "All Dates"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Printed On</span>
                      <p className="text-xs font-bold">{new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="bg-slate-900 text-white print:bg-slate-200 print:text-black">
                <th className="p-4 text-[10px] font-black uppercase text-left rounded-tl-xl">Court Station</th>
                <th className="p-4 text-[10px] font-black uppercase text-left">Deceased Name</th>
                <th className="p-4 text-[10px] font-black uppercase text-left">Cause No</th>
                <th className="p-4 text-[10px] font-black uppercase text-center">Compliance</th>
                <th className="p-4 text-[10px] font-black uppercase text-right rounded-tr-xl">GP Forwarding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r._id} className="page-break-inside-avoid">
                  <td className="p-4 text-[11px] font-bold text-slate-600 uppercase">{r.courtStation?.name}</td>
                  <td className="p-4 text-[11px] font-black text-slate-900 uppercase">{r.nameOfDeceased}</td>
                  <td className="p-4 font-mono text-[10px] text-slate-500">{r.causeNo}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      r.form60Compliance === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {r.form60Compliance}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] font-black text-right uppercase">
                    {r.dateForwardedToGP ? r.dateForwardedToGP.split('T')[0] : <span className="text-amber-600">Pending</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="pt-10">
                  <div className="flex justify-between items-end border-t border-slate-200 pt-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">System Authentication</p>
                      <p className="text-[9px] text-slate-500 italic">Urithi Registry Compliance Division</p>
                    </div>
                    <div className="text-right">
                      <div className="h-10 w-32 border-b-2 border-slate-300 ml-auto mb-2"></div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">Official Stamp/Sign</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          @page { 
            size: portrait; 
            margin: 0; /* REMOVES BROWSER HEADERS/FOOTERS */
          }
          .print-container {
            padding: 20mm 15mm !important; /* REPLACES MARGIN FOR CONTENT */
          }
          table { width: 100%; border-spacing: 0; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default ReportsPage;
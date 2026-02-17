import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Download,
  FileText,
  Loader2,
  ExternalLink,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { fetchGpDashboard, REJECTION_STATUS } from "../../store/slices/gpSlice";
import type { AppDispatch, RootState } from "../../store/store";

const RecordsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading } = useSelector((state: RootState) => state.gp);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchGpDashboard());
  }, [dispatch]);

  const records = dashboard?.records || [];

  // Filter Logic
  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.causeNo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "ALL" || record.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading && records.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#013220] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Loading Registry Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Master <span className="text-emerald-700">Ledger</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Global Compliance Rejection Archives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Filter Cause No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#013220] transition-all w-full md:w-64 shadow-sm"
            />
          </div>

          <button className="flex items-center gap-2 px-5 py-3 bg-[#013220] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0a4730] transition-all shadow-lg shadow-emerald-900/20">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
        {["ALL", "PENDING", "RECTIFIED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative
              ${activeFilter === tab ? "text-[#013220]" : "text-slate-400 hover:text-slate-600"}`}
          >
            {tab}
            {activeFilter === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#013220] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Cause Identification</th>
                <th className="px-8 py-5">Rejection Reason</th>
                <th className="px-8 py-5 text-center">Registrar</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr
                    key={record._id}
                    className="group hover:bg-slate-50/80 transition-all"
                  >
                    {/* Cause No */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-[#013220] group-hover:bg-[#013220] group-hover:text-white transition-all shadow-inner">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">
                            {record.causeNo}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            Ref: {record._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rejection Reason */}
                    <td className="px-8 py-6 max-w-xs">
                      <div className="flex items-start gap-2 text-slate-600">
                        <AlertCircle
                          size={14}
                          className="mt-0.5 text-rose-500 shrink-0"
                        />
                        <p className="text-xs font-medium leading-relaxed line-clamp-2">
                          {record.rejectionReason || "No reason specified"}
                        </p>
                      </div>
                    </td>

                    {/* Officer Name - FIXED UNDEFINED ERROR */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-700 mb-1">
                          <UserIcon size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
                          {record.updatedBy?.firstName &&
                          record.updatedBy?.lastName
                            ? `${record.updatedBy.firstName} ${record.updatedBy.lastName}`
                            : "Unknown Officer"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                          ${
                            record.status === REJECTION_STATUS.PENDING
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    </td>

                    {/* External Link */}
                    <td className="px-8 py-6 text-right">
                      <a
                        href={record.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[#013220] hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                      >
                        Review <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-32 text-center text-slate-300 uppercase font-black tracking-widest text-xs opacity-40"
                  >
                    No records found in database
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

export default RecordsPage;

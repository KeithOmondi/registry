import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Download,
  Loader2,
  AlertCircle,
  User as UserIcon,
  MapPin,
  Calendar,
  ShieldAlert,
  Archive,
  FileX,
  FileCheck,
} from "lucide-react";
import { fetchGpDashboard } from "../../store/slices/gpSlice";
import type { AppDispatch, RootState } from "../../store/store";

const RecordsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading } = useSelector((state: RootState) => state.gp);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "REJECTED" | "RECTIFIED"
  >("ALL");

  useEffect(() => {
    dispatch(fetchGpDashboard());
  }, [dispatch]);

  const records = dashboard?.records || [];

  const filteredRecords = records.filter((record) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch =
      record.causeNo.toLowerCase().includes(searchStr) ||
      record.deceasedName?.toLowerCase().includes(searchStr) ||
      record.courtStation?.name?.toLowerCase().includes(searchStr);

    const statusMap: Record<string, string> = {
      pending: "REJECTED",
      rectified: "RECTIFIED",
    };
    const recordStatus =
      statusMap[record.status] || record.status.toUpperCase();

    const matchesFilter =
      activeFilter === "ALL" || recordStatus === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading && records.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#013220] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Syncing Rejection Archives...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Rejection <span className="text-rose-700">Archives</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Ministry of Justice Compliance Records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-700 transition-all w-full md:w-80 shadow-sm"
            />
          </div>

          <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
        {["ALL", "REJECTED", "RECTIFIED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab as any)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative
              ${activeFilter === tab ? "text-rose-700" : "text-slate-400 hover:text-slate-600"}`}
          >
            {tab}
            {activeFilter === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-700 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5 text-rose-800/60">Case Identity</th>
                <th className="px-8 py-5">Subject (Deceased)</th>
                <th className="px-8 py-5">Station & Date</th>
                <th className="px-8 py-5">Compliance Breach</th>
                <th className="px-8 py-5">Proof Status</th>
                <th className="px-8 py-5 text-center">Archive Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const statusMap: Record<string, string> = {
                    pending: "REJECTED",
                    rectified: "RECTIFIED",
                  };
                  const recordStatus =
                    statusMap[record.status] || record.status.toUpperCase();

                  return (
                    <tr
                      key={record._id}
                      className="group hover:bg-slate-50/80 transition-all"
                    >
                      {/* Cause No */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-700 group-hover:bg-rose-700 group-hover:text-white transition-all shadow-inner">
                            <ShieldAlert size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">
                              {record.causeNo}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                              <UserIcon size={10} />
                              {record.updatedBy?.firstName}{" "}
                              {record.updatedBy?.lastName?.charAt(0)}.
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Deceased Name */}
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-700 uppercase tracking-tight">
                          {record.deceasedName || "N/A"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                          <Archive size={10} /> ID:{" "}
                          {record._id.slice(-8).toUpperCase()}
                        </p>
                      </td>

                      {/* Court Station & Date */}
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin size={12} className="text-rose-600" />
                            <span className="text-[10px] font-black uppercase tracking-tight">
                              {record.courtStation?.name?.split("-")[0] ||
                                "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold">
                              {record.dateReceived
                                ? new Date(
                                    record.dateReceived,
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "---"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rejection Reason */}
                      <td className="px-8 py-6 max-w-xs">
                        <div className="flex items-start gap-2 text-slate-500">
                          <AlertCircle
                            size={14}
                            className="mt-0.5 text-rose-400 shrink-0"
                          />
                          <p className="text-[11px] font-semibold leading-relaxed line-clamp-2">
                            {record.rejectionReason}
                          </p>
                        </div>
                      </td>

                      {/* Proof Status (NEW - Replaces the external link column) */}
                      <td className="px-8 py-6">
                        {record.fileUrl ? (
                          <a
                            href={record.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <FileCheck size={14} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">
                              View Proof
                            </span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <FileX size={14} />
                            <span className="text-[9px] font-black uppercase tracking-tighter">
                              No Proof
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <span
                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm
                              ${
                                recordStatus === "REJECTED"
                                  ? "bg-rose-50 text-rose-700 border-rose-100"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
                              }`}
                          >
                            {recordStatus}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-32 text-center text-slate-300 uppercase font-black tracking-widest text-xs opacity-40"
                  >
                    Archive is empty for this criteria
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

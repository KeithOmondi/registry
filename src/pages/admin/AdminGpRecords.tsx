import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  FileWarning,
  History,
  User,
  FileX,
  FileCheck,
} from "lucide-react";
import {
  fetchAllRecordsForAdmin,
  resetGpStatus,
} from "../../store/slices/gpSlice";
import type { AppDispatch, RootState } from "../../store/store";

const AdminGpRecordsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { adminRecords, loading } = useSelector(
    (state: RootState) => state.gp,
  );

  useEffect(() => {
    dispatch(fetchAllRecordsForAdmin());
    return () => {
      dispatch(resetGpStatus());
    };
  }, [dispatch]);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-rose-100 text-rose-700 border-rose-200",
          icon: <AlertCircle size={12} className="fill-rose-700 text-white" />,
          label: "REJECTED",
        };
      case "rectified":
        return {
          bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: <CheckCircle size={12} className="fill-emerald-700 text-white" />,
          label: "RECTIFIED",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <Clock size={12} />,
          label: status?.toUpperCase() || "UNKNOWN",
        };
    }
  };

  // SORTING LOGIC: Highest (Newest) to Lowest (Oldest)
  const sortedRecords = [...adminRecords].sort((a, b) => {
    return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#355E3B] rounded-2xl shadow-lg shadow-[#355E3B]/20 text-white">
              <FileWarning size={32} className="text-[#EFBF04]" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
                REJECTION <span className="text-[#355E3B]">WATCHLIST</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Administrative Control Ledger
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600">
              <History size={16} /> Audit Logs
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 bg-[#355E3B] p-6 rounded-[2rem] text-white flex items-center justify-between overflow-hidden relative shadow-xl">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#EFBF04] mb-1">Total Logs</p>
              <p className="text-4xl font-black tracking-tighter">{adminRecords.length}</p>
              <p className="text-xs text-emerald-100/60 mt-2 font-medium italic">Ordered by most recent entries</p>
            </div>
            <Building2 className="absolute -right-4 -bottom-4 text-white/5" size={120} />
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Pending Action</p>
            <p className="text-3xl font-black text-slate-900">{adminRecords.filter((r) => r.status === "pending").length}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Rectified</p>
            <p className="text-3xl font-black text-slate-900">{adminRecords.filter((r) => r.status === "rectified").length}</p>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading && adminRecords.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#355E3B] mb-4" size={48} />
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Syncing Ledger...</p>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Rejection Reason</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center border-b border-slate-100">Attachment</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Station Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRecords.map((record) => {
                    const status = getStatusConfig(record.status);
                    return (
                      <tr key={record._id} className="group hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest ${status.bg}`}>
                            {status.icon} {status.label}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-black text-slate-900 tracking-tight uppercase">{record.causeNo}</span>
                            <div className="flex items-center gap-1.5 bg-white shadow-sm w-fit px-2 py-0.5 rounded border border-slate-200">
                              <User size={10} className="text-[#EFBF04]" />
                              <span className="text-[10px] font-black text-slate-600 uppercase">{record.deceasedName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 max-w-xs">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 italic">
                            "{record.rejectionReason}"
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center justify-center">
                            {record.fileUrl ? (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                                <FileCheck size={14} />
                                <span className="text-[9px] font-black uppercase">Archived</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400">
                                <FileX size={14} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">Missing</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-[#355E3B]">
                              {record.courtStation?.name || "Unknown Station"}
                            </span>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                              Level: {record.courtStation?.level || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#355E3B] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white uppercase">
                              {record.updatedBy?.firstName?.[0] || "S"}{record.updatedBy?.lastName?.[0] || ""}
                            </div>
                            <div className="flex flex-col text-[10px] font-black uppercase tracking-tighter text-slate-800">
                              {record.updatedBy ? `${record.updatedBy.firstName} ${record.updatedBy.lastName}` : "System Admin"}
                              <span className="text-[9px] font-medium normal-case text-slate-400">
                                {record.dateReceived ? new Date(record.dateReceived).toLocaleDateString() : "No Date"}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGpRecordsPage;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Building2,
  AlertCircle,
  Clock,
  CheckCircle,
  Loader2,
  ExternalLink,
  Eye,
  X,
  FileWarning,
  History,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  fetchAllRecordsForAdmin,
  fetchProxyPreview,
  resetGpStatus,
  clearPreview,
} from "../../store/slices/gpSlice";
import type { AppDispatch, RootState } from "../../store/store";

const AdminGpRecordsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewType, setPreviewType] = useState<"pdf" | "image" | null>(null);

  const { adminRecords, loading, loadingPreview, previewBlobUrl } = useSelector(
    (state: RootState) => state.gp,
  );

  useEffect(() => {
    dispatch(fetchAllRecordsForAdmin());
    return () => {
      dispatch(resetGpStatus());
      dispatch(clearPreview());
    };
  }, [dispatch]);

  const handleOpenPreview = async (recordId: string) => {
    setIsModalOpen(true);
    try {
      await dispatch(fetchProxyPreview(recordId)).unwrap();
      const record = adminRecords.find((r) => r._id === recordId);
      const isPdf = record?.fileUrl.toLowerCase().endsWith(".pdf");
      setPreviewType(isPdf ? "pdf" : "image");
    } catch (err) {
      setPreviewType(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewType(null);
    dispatch(clearPreview());
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-rose-100 text-rose-700 border-rose-200",
          icon: <AlertCircle size={12} className="fill-rose-700 text-white" />,
          label: "REJECTED",
        };
      case "rectified":
        return {
          bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: (
            <CheckCircle size={12} className="fill-emerald-700 text-white" />
          ),
          label: "RECTIFIED",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          icon: <Clock size={12} />,
          label: status.toUpperCase(),
        };
    }
  };

  const filteredRecords = adminRecords.filter(
    (record) =>
      record.causeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.deceasedName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-200 text-white">
              <FileWarning size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
                REJECTION{" "}
                <span className="text-slate-400 not-italic">WATCHLIST</span>
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Secure Proxy Ledger Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600">
              <History size={16} /> Audit Logs
            </button>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 bg-[#013220] p-6 rounded-[2rem] text-white flex items-center justify-between overflow-hidden relative shadow-xl">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                Incoming Rejections
              </p>
              <p className="text-4xl font-black tracking-tighter">
                {adminRecords.length}
              </p>
              <p className="text-xs text-emerald-200/60 mt-2 font-medium">
                Total entries flagged for review
              </p>
            </div>
            <Building2
              className="absolute -right-4 -bottom-4 text-white/5"
              size={120}
            />
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-rose-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">
              Active Rejections
            </p>
            <p className="text-3xl font-black text-slate-900">
              {adminRecords.filter((r) => r.status === "pending").length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">
              Resolved
            </p>
            <p className="text-3xl font-black text-slate-900">
              {adminRecords.filter((r) => r.status === "rectified").length}
            </p>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Cause No or Deceased Name..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-rose-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading && adminRecords.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2
                  className="animate-spin text-rose-600 mb-4"
                  size={48}
                />
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  Synchronizing...
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      File & Deceased
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Reason
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Preview
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Station
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      LOGGED BY
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => {
                    const status = getStatusConfig(record.status);
                    return (
                      <tr
                        key={record._id}
                        className="group hover:bg-rose-50/30 transition-all"
                      >
                        <td className="px-8 py-6">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest ${status.bg}`}
                          >
                            {status.icon} {status.label}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-black text-slate-900 tracking-tight">
                              {record.causeNo}
                            </span>
                            <div className="flex items-center gap-1.5 bg-white shadow-sm w-fit px-2 py-0.5 rounded border border-slate-200">
                              <User size={10} className="text-rose-500" />
                              <span className="text-[10px] font-black text-slate-600 uppercase">
                                {record.deceasedName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 max-w-xs">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                            {record.rejectionReason}
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenPreview(record._id)}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-rose-600 hover:border-rose-500 transition-all shadow-sm"
                            >
                              <Eye size={16} />
                            </button>
                            <a
                              href={record.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 transition-all"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-700">
                              {record.courtStation.name}
                            </span>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                              {record.courtStation.level}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#013220] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                              {record.updatedBy?.firstName?.[0]}
                              {record.updatedBy?.lastName?.[0]}
                            </div>
                            <div className="flex flex-col text-[10px] font-black uppercase tracking-tighter text-slate-800">
                              {record.updatedBy
                                ? `${record.updatedBy.firstName} ${record.updatedBy.lastName}`
                                : "System"}
                              <span className="text-[9px] font-medium normal-case text-slate-400">
                                {new Date(
                                  record.dateReceived,
                                ).toLocaleDateString()}
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

      {/* SECURE DOCUMENT PREVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white w-full max-w-6xl h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-rose-600 text-white rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                    Secure File Preview
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Authorized Access Only
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-3 bg-slate-50 hover:bg-rose-50 rounded-2xl transition-all text-slate-400 hover:text-rose-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 relative">
              {loadingPreview ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2
                    className="animate-spin text-rose-600 mb-4"
                    size={48}
                  />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Decrypting Asset...
                  </p>
                </div>
              ) : previewBlobUrl && previewType === "pdf" ? (
                <iframe
                  src={previewBlobUrl}
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : previewBlobUrl && previewType === "image" ? (
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <img
                    src={previewBlobUrl}
                    alt="Secure Preview"
                    className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <FileWarning size={40} />
                  <p className="text-sm font-black uppercase tracking-widest">
                    Secure preview unavailable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGpRecordsPage;

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import type { Record as RecordType } from "../../store/slices/recordsSlice";
import {
  fetchRecords,
  updateMultipleRecordsDateForwarded,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";
import EditRecord from "./EditRecord";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Edit3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
} from "lucide-react";

const RecordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { records = [] } = useSelector((state: RootState) => state.records);
  const { courts = [] } = useSelector((state: RootState) => state.courts);

  const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDate, setBulkDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [courtFilter, setCourtFilter] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

  /* =========================
      FILTER LOGIC
  ========================= */
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.nameOfDeceased?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.causeNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourt = !courtFilter || r.courtStation?._id === courtFilter;
      return matchesSearch && matchesCourt;
    });
  }, [records, searchTerm, courtFilter]);

  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handleBulkUpdate = async () => {
    if (!bulkDate) return toast.error("Please select a date");
    try {
      await dispatch(
        updateMultipleRecordsDateForwarded({
          ids: selectedIds,
          date: bulkDate,
        })
      ).unwrap();
      toast.success("Batch updated successfully");
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F9F9F7] min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* HEADER & STATS */}
      <div className="max-w-[1800px] mx-auto mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#004832] uppercase tracking-tight">
            Probate Records Registry
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Registry Management & Lead Time Tracking
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm min-w-[120px]">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">
              Total Listed
            </span>
            <span className="text-xl font-black text-[#004832]">
              {filteredRecords.length}
            </span>
          </div>
        </div>
      </div>

      {/* FILTERS & BULK ACTIONS */}
      <div className="max-w-[1800px] mx-auto mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative min-w-[300px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Deceased or Cause No..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-[#004832] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#004832] transition-all"
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
          >
            <option value="">All Court Stations</option>
            {courts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-[#004832] text-white px-4 py-2 rounded-xl animate-in fade-in zoom-in duration-300">
            <span className="text-xs font-bold">
              {selectedIds.length} Selected
            </span>
            <input
              type="date"
              className="text-slate-900 text-xs rounded px-2 py-1 outline-none border-none focus:ring-2 focus:ring-[#C8A239]"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
            />
            <button
              onClick={handleBulkUpdate}
              className="bg-[#C8A239] hover:bg-[#b38f2f] text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-colors"
            >
              Forward to GP
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="hover:text-red-400 transition-colors"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="max-w-[1800px] mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-[#004832] text-white uppercase text-[10px] tracking-widest font-black">
                <th className="p-4 text-center w-12">
                  <input
                    type="checkbox"
                    className="accent-[#C8A239]"
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedIds(currentRecords.map((r) => r._id))
                        : setSelectedIds([])
                    }
                  />
                </th>
                <th className="p-4">Court Station</th>
                <th className="p-4">Cause No.</th>
                <th className="p-4">Name of Deceased</th>
                <th className="p-4">Date Received At PR</th>
                <th className="p-4">Date On E-Citizen Receipt</th>
                <th className="p-4 text-center">Receiving Lead Time</th>
                <th className="p-4">Date Forwarded To GP</th>
                <th className="p-4 text-center">Forwarding Lead Time</th>
                <th className="p-4">Form 60 Compliance</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRecords.map((r) => (
                <tr
                  key={r._id}
                  className="hover:bg-slate-50 transition-colors group/row"
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      className="accent-[#004832]"
                      checked={selectedIds.includes(r._id)}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(r._id)
                            ? prev.filter((id) => id !== r._id)
                            : [...prev, r._id]
                        )
                      }
                    />
                  </td>
                  <td className="p-4 font-bold text-[#004832]">
                    {r.courtStation?.name}
                  </td>
                  <td className="p-4 font-mono text-xs">{r.causeNo}</td>
                  <td className="p-4 font-black uppercase text-[#1a3a32]">
                    {r.nameOfDeceased}
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-medium">
                    {new Date(r.dateReceived).toLocaleDateString("en-KE")}
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-medium">
                    {r.dateOfReceipt
                      ? new Date(r.dateOfReceipt).toLocaleDateString("en-KE")
                      : "—"}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-md font-bold text-[10px] ${
                        Number(r.receivingLeadTime) > 5
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {r.receivingLeadTime ?? 0} Days
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-medium">
                    {r.dateForwardedToGP ? (
                      new Date(r.dateForwardedToGP).toLocaleDateString("en-KE")
                    ) : (
                      <span className="italic opacity-50 text-[10px]">Pending</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-500 text-[10px]">
                      {r.forwardingLeadTime ?? "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                          r.form60Compliance === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.form60Compliance === "Approved" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {r.form60Compliance}
                      </span>
                      {/* Rejection reason persists */}
                      {r.rejectionReason && (
                        <span className="text-[9px] text-red-400 italic font-medium leading-tight max-w-[120px]">
                          {r.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedRecord(r);
                          setEditMode(true);
                        }}
                        className="p-2 hover:bg-[#004832]/10 text-[#004832] rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit3 size={16} />
                      </button>

                      {/* AUDIT POPUP */}
                      {r.updatedBy && (
                        <div className="relative group/audit">
                          <button className="p-2 hover:bg-[#C8A239]/10 text-slate-400 hover:text-[#C8A239] rounded-lg transition-colors cursor-help">
                            <Info size={16} />
                          </button>
                          <div className="absolute bottom-full right-0 mb-3 hidden group-hover/audit:block w-72 bg-[#1a1a1a] text-white p-4 rounded-2xl shadow-2xl z-[150] border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h4 className="text-[10px] font-black text-[#C8A239] uppercase tracking-widest">
                                  System Audit Log
                                </h4>
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                              <div className="flex justify-between items-start gap-4">
                                <span className="text-slate-400 text-[9px] uppercase font-bold">
                                  Officer
                                </span>
                                <span className="text-[11px] font-semibold text-right">
                                  {r.updatedBy.firstName} {r.updatedBy.lastName}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <div>
                                  <span className="text-slate-400 text-[9px] uppercase font-bold block">
                                    Date
                                  </span>
                                  <span className="text-[10px]">
                                    {new Date(r.updatedAt).toLocaleDateString("en-KE")}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[9px] uppercase font-bold block">
                                    Time
                                  </span>
                                  <span className="text-[10px]">
                                    {new Date(r.updatedAt).toLocaleTimeString("en-KE", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-white/5 bg-white/5 p-2 rounded-lg">
                                <span className="text-[8px] text-[#C8A239] uppercase font-black block mb-1">
                                  Last Activity
                                </span>
                                <p className="text-[10px] text-slate-200 italic leading-tight">
                                  {r.lastEditAction || "Manual database adjustment"}
                                </p>
                              </div>
                            </div>
                            <div className="absolute top-full right-4 border-[6px] border-transparent border-t-[#1a1a1a]"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {editMode && selectedRecord && (
        <div className="fixed inset-0 bg-[#004832]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-[#004832] uppercase tracking-widest flex items-center gap-2">
                <Clock size={18} className="text-[#C8A239]" /> Update Probate
                Record: {selectedRecord.causeNo}
              </h3>
              <button
                onClick={() => setEditMode(false)}
                className="text-slate-400 hover:text-red-500 transition-all p-1"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
              <EditRecord
                record={selectedRecord}
                onClose={() => {
                  setEditMode(false);
                  dispatch(fetchRecords()); // ensures latest audit + rejection reason
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordPage;

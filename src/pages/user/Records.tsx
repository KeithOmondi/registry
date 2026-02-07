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
  Filter,
  MapPin,
  Calendar,
  Send,
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
  const [courtSearch, setCourtSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(fetchRecords());
  }, [dispatch]);

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
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handleBulkUpdate = async () => {
    if (!bulkDate) return toast.error("Please select a date");
    try {
      await dispatch(
        updateMultipleRecordsDateForwarded({
          ids: selectedIds,
          date: bulkDate,
        }),
      ).unwrap();
      toast.success("Batch updated successfully");
      setSelectedIds([]);
      setBulkDate("");
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F9F9F7] min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#004832] uppercase tracking-tighter">
            Probate Records <span className="text-[#C8A239]">Registry</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-300"></span>
            Registry Management & Lead Time Tracking
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">
              Total Records
            </span>
            <span className="text-xl font-black text-[#004832]">
              {filteredRecords.length}
            </span>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* REFINED FILTER SECTION */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
          {/* Search Input Group */}
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004832] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by Deceased Name or Cause Number..."
              className="w-full pl-12 pr-4 py-4 bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-slate-200 mx-2"></div>

          {/* Court Filter Group */}
          <div className="flex flex-col md:flex-row items-center gap-2 px-2 pb-2 lg:pb-0">
            <div className="relative w-full md:w-64">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Quick find court..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl text-xs outline-none transition-all"
                value={courtSearch}
                onChange={(e) => setCourtSearch(e.target.value)}
              />
            </div>

            <div className="relative w-full md:w-64">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="w-full pl-9 pr-8 py-2.5 bg-slate-100 hover:bg-slate-200/50 border-none rounded-xl text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer transition-all"
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
              >
                <option value="">All Stations</option>
                {courts
                  .filter((c) =>
                    c.name.toLowerCase().includes(courtSearch.toLowerCase()),
                  )
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={14} className="rotate-90 text-slate-400" />
              </div>
            </div>

            {searchTerm || courtFilter ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCourtFilter("");
                  setCourtSearch("");
                }}
                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Clear Filters"
              >
                <XCircle size={20} />
              </button>
            ) : null}
          </div>
        </div>

        {/* FLOATING BULK ACTION BAR */}
        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-[#004832] p-2 pl-6 rounded-2xl shadow-lg border border-[#003626] animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center bg-[#C8A239] text-[#004832] w-8 h-8 rounded-full font-black text-sm">
                {selectedIds.length}
              </div>
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                Records Selected for Forwarding
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="date"
                  className="pl-9 pr-4 py-2 bg-[#003626] text-white text-xs rounded-xl outline-none border border-white/10 focus:border-[#C8A239] transition-all"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                />
              </div>
              <button
                onClick={handleBulkUpdate}
                className="flex items-center gap-2 bg-[#C8A239] hover:bg-[#D4AF37] text-[#004832] text-[10px] font-black uppercase px-6 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <Send size={14} />
                Forward to GP
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-2 text-white/50 hover:text-white transition-colors mr-2"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="max-w-[1800px] mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-[0.15em] font-black border-b border-slate-100">
                <th className="p-5 text-center w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#004832] focus:ring-[#004832]"
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedIds(currentRecords.map((r) => r._id))
                        : setSelectedIds([])
                    }
                  />
                </th>
                <th className="p-5">Court Station</th>
                <th className="p-5">Cause No.</th>
                <th className="p-5">Name of Deceased</th>
                <th className="p-5">Date Received</th>
                <th className="p-5">E-Citizen Date</th>
                <th className="p-5 text-center">Receiving Lead</th>
                <th className="p-5">Forwarded To GP</th>
                <th className="p-5 text-center">Forwarding Lead</th>
                <th className="p-5">Form 60 Status</th>
                <th className="p-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentRecords.map((r) => (
                <tr
                  key={r._id}
                  className="hover:bg-[#F9F9F7]/50 transition-colors group/row"
                >
                  <td className="p-5 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-[#004832] focus:ring-[#004832]"
                      checked={selectedIds.includes(r._id)}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(r._id)
                            ? prev.filter((id) => id !== r._id)
                            : [...prev, r._id],
                        )
                      }
                    />
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-bold text-[10px] uppercase">
                      {r.courtStation?.name}
                    </span>
                  </td>
                  <td className="p-5 font-mono text-xs font-bold text-slate-500">
                    {r.causeNo}
                  </td>
                  <td className="p-5 font-black uppercase text-[#004832] tracking-tight">
                    {r.nameOfDeceased}
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-medium">
                    {new Date(r.dateReceived).toLocaleDateString("en-KE")}
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-medium">
                    {r.dateOfReceipt
                      ? new Date(r.dateOfReceipt).toLocaleDateString("en-KE")
                      : "—"}
                  </td>
                  <td className="p-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-[10px] ${
                        Number(r.receivingLeadTime) > 5
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {r.receivingLeadTime ?? 0} Days
                    </span>
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-medium">
                    {r.dateForwardedToGP ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 size={14} />
                        {new Date(r.dateForwardedToGP).toLocaleDateString(
                          "en-KE",
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-bold italic">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <span className="font-bold text-slate-400 text-[10px]">
                      {r.forwardingLeadTime ?? "—"}
                    </span>
                  </td>
                  <td className="p-5">
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
                      {r.rejectionReason && (
                        <span className="text-[9px] text-red-400 italic font-medium leading-tight max-w-[120px]">
                          {r.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRecord(r);
                          setEditMode(true);
                        }}
                        className="p-2 hover:bg-[#004832] hover:text-white text-[#004832] rounded-xl transition-all shadow-sm border border-slate-100"
                        title="Edit Record"
                      >
                        <Edit3 size={16} />
                      </button>

                      {r.updatedBy && (
                        <div className="relative group/audit">
                          <button className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-help border border-slate-100">
                            <Info size={16} />
                          </button>
                          <div className="absolute bottom-full right-0 mb-3 hidden group-hover/audit:block w-72 bg-[#1a1a1a] text-white p-5 rounded-3xl shadow-2xl z-[150] border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h4 className="text-[10px] font-black text-[#C8A239] uppercase tracking-widest">
                                  System Audit Log
                                </h4>
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              </div>
                              <div className="flex justify-between items-start gap-4">
                                <span className="text-slate-400 text-[9px] uppercase font-bold">
                                  Officer
                                </span>
                                <span className="text-[11px] font-semibold text-right">
                                  {r.updatedBy.firstName} {r.updatedBy.lastName}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                                <div>
                                  <span className="text-slate-400 text-[9px] uppercase font-bold block mb-1">
                                    Date
                                  </span>
                                  {new Date(r.updatedAt).toLocaleDateString(
                                    "en-KE",
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 text-[9px] uppercase font-bold block mb-1">
                                    Time
                                  </span>
                                  {new Date(r.updatedAt).toLocaleTimeString(
                                    "en-KE",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 pt-3 border-t border-white/5 bg-white/5 p-3 rounded-2xl">
                                <span className="text-[8px] text-[#C8A239] uppercase font-black block mb-1">
                                  Last Action
                                </span>
                                <p className="text-[10px] text-slate-200 italic leading-snug">
                                  {r.lastEditAction ||
                                    "System generated update"}
                                </p>
                              </div>
                            </div>
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
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-[#004832] hover:text-white hover:border-[#004832] transition-all flex items-center gap-2 text-xs font-bold"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-[#004832] hover:text-white hover:border-[#004832] transition-all flex items-center gap-2 text-xs font-bold"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {editMode && selectedRecord && (
        <div className="fixed inset-0 bg-[#001a12]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black text-[#C8A239] uppercase tracking-widest block mb-1">
                  Update Registry Record
                </span>
                <h3 className="text-xl font-black text-[#004832] uppercase tracking-tight flex items-center gap-3">
                  {selectedRecord.causeNo}
                </h3>
              </div>
              <button
                onClick={() => setEditMode(false)}
                className="bg-white text-slate-400 hover:text-red-500 transition-all p-3 rounded-2xl shadow-sm border border-slate-100"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-10 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <EditRecord
                record={selectedRecord}
                onClose={() => {
                  setEditMode(false);
                  dispatch(fetchRecords());
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

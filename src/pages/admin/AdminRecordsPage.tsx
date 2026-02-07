import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Trash2,
  Search,
  Info,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchRecords,
  deleteRecord,
  updateMultipleRecordsDateForwarded,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";
import toast, { Toaster } from "react-hot-toast";

const AdminRecordsPage = () => {
  const dispatch = useAppDispatch();
  const { records } = useAppSelector((state) => state.records);
  const { courts } = useAppSelector((state) => state.courts);

  /* =======================
      STATE
  ======================== */
  const [searchTerm, setSearchTerm] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDate, setBulkDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  /* =======================
      LOAD DATA
  ======================== */
  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchCourts());
  }, [dispatch]);

  /* =======================
      FILTER & PAGINATE
  ======================== */
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

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, courtFilter]);

  /* =======================
      HANDLERS
  ======================== */
  const handleDelete = (id: string) => {
    if (window.confirm("Permanently delete this record? This action is irreversible.")) {
      dispatch(deleteRecord(id));
      toast.success("Record purged from system");
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkDate) return toast.error("Select forwarding date");
    try {
      await dispatch(
        updateMultipleRecordsDateForwarded({
          ids: selectedIds,
          date: bulkDate,
        }),
      ).unwrap();
      toast.success("Batch update complete");
      setSelectedIds([]);
      setBulkDate("");
    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className="p-8 max-w-[1900px] mx-auto space-y-6">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <Database className="text-emerald-600" size={32} />
            Admin Records Vault
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Full System Audit & Registry Control
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Listed</p>
            <p className="text-xl font-black text-slate-800">{filteredRecords.length}</p>
          </div>
        </div>
      </div>

      {/* FILTER + BULK BAR */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search Deceased or Cause No..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
          value={courtFilter}
          onChange={(e) => setCourtFilter(e.target.value)}
        >
          <option value="">All Court Stations</option>
          {courts.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-1.5 rounded-xl animate-in zoom-in duration-300">
            <span className="text-[10px] font-black uppercase">{selectedIds.length} Selected</span>
            <input
              type="date"
              className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border-none"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
            />
            <button onClick={handleBulkUpdate} className="bg-emerald-600 text-[10px] font-black uppercase px-3 py-2 rounded-lg">Forward to GP</button>
            <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-white"><XCircle size={18} /></button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 font-black text-[9px] text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-5 text-center w-12">
                  <input
                    type="checkbox"
                    className="accent-emerald-600"
                    onChange={(e) => e.target.checked ? setSelectedIds(paginatedRecords.map((r) => r._id)) : setSelectedIds([])}
                  />
                </th>
                <th className="px-4 py-5 text-left">Court Station</th>
                <th className="px-4 py-5 text-left">Cause No.</th>
                <th className="px-4 py-5 text-left">Name of Deceased</th>
                <th className="px-4 py-5 text-left">Received At PR</th>
                <th className="px-4 py-5 text-left">E-Citizen Receipt</th>
                <th className="px-4 py-5 text-center">Receiving Lead</th>
                <th className="px-4 py-5 text-left">Forwarded To GP</th>
                <th className="px-4 py-5 text-center">Forwarding Lead</th>
                <th className="px-4 py-5 text-left">Compliance</th>
                <th className="px-4 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {paginatedRecords.map((r) => (
                <tr key={r._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      className="accent-emerald-600"
                      checked={selectedIds.includes(r._id)}
                      onChange={() => setSelectedIds((prev) => prev.includes(r._id) ? prev.filter((id) => id !== r._id) : [...prev, r._id])}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">{r.courtStation?.name}</span>
                  </td>
                  <td className="px-4 py-4 text-xs font-mono font-bold">{r.causeNo}</td>
                  <td className="px-4 py-4 text-xs font-black uppercase text-slate-600">{r.nameOfDeceased}</td>
                  <td className="px-4 py-4 text-[11px] text-slate-500">{new Date(r.dateReceived).toLocaleDateString("en-KE")}</td>
                  <td className="px-4 py-4 text-[11px] text-slate-500">{r.dateOfReceipt ? new Date(r.dateOfReceipt).toLocaleDateString("en-KE") : "—"}</td>
                  
                  {/* UPDATE: RECEIVING LEAD COLOR LOGIC (Threshold > 30) */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (r.receivingLeadTime ?? 0) > 30 
                          ? "bg-red-50 text-red-600" 
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.receivingLeadTime ?? 0} Days
                    </span>
                  </td>

                  <td className="px-4 py-4 text-[11px] text-slate-500">
                    {r.dateForwardedToGP ? new Date(r.dateForwardedToGP).toLocaleDateString("en-KE") : "Pending"}
                  </td>

                  {/* UPDATE: FORWARDING LEAD COLOR LOGIC (Threshold > 30) */}
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (r.forwardingLeadTime ?? 0) > 30
                          ? "bg-red-50 text-red-600"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {r.forwardingLeadTime ?? "—"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 w-fit ${r.form60Compliance === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {r.form60Compliance === "Approved" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {r.form60Compliance}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    {r.updatedBy && (
                      <div className="relative inline-block group">
                        <button className="p-1.5 text-slate-300 hover:text-emerald-600"><Info size={16} /></button>
                        <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 text-left">
                          <h4 className="text-[9px] font-black text-emerald-400 uppercase mb-2">Edit Audit Log</h4>
                          <p className="text-[10px]">{r.updatedBy.firstName} {r.updatedBy.lastName}</p>
                          <p className="text-[9px] opacity-60 mt-2 font-mono">{new Date(r.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    <button onClick={() => handleDelete(r._id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                      currentPage === pageNum
                        ? "bg-[#b48222] text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-400 hover:border-[#b48222] hover:text-[#b48222]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecordsPage;
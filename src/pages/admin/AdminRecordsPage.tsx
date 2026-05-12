import { useEffect, useMemo, useState, useCallback, type ChangeEvent } from "react";
import {
  Database,
  Trash2,
  Search,
  Calendar,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowDownWideNarrow,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchRecords,
  deleteRecord,
  updateMultipleRecordsDateForwarded,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";
import toast, { Toaster } from "react-hot-toast";

// Define strict types
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

type SortByType = "date" | "leadTime";

const AdminRecordsPage = () => {
  const dispatch = useAppDispatch();
  const { records } = useAppSelector((state) => state.records);
  const { courts } = useAppSelector((state) => state.courts);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courtFilter, setCourtFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortByType>("date");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDate, setBulkDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 15;

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchCourts());
  }, [dispatch]);

  /* ================= 1. FILTER & SORT LOGIC (Declared First) ================= */
  const processedRecords = useMemo(() => {
    const filtered = records.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        r.nameOfDeceased?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.causeNo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourt = !courtFilter || r.courtStation?._id === courtFilter;

      const matchesMonth =
        monthFilter === "all" ||
        (r.dateReceived && new Date(r.dateReceived).getMonth().toString() === monthFilter);

      return matchesSearch && matchesCourt && matchesMonth;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "leadTime") {
        return (b.receivingLeadTime ?? 0) - (a.receivingLeadTime ?? 0);
      }
      return new Date(b.dateReceived).getTime() - new Date(a.dateReceived).getTime();
    });
  }, [records, searchTerm, courtFilter, monthFilter, sortBy]);

  const totalPages = Math.ceil(processedRecords.length / itemsPerPage);

  // Safe calculation of the current page index
  const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedRecords = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return processedRecords.slice(start, start + itemsPerPage);
  }, [processedRecords, activePage]);

  /* ================= 2. HANDLERS (Dependent on Paginated Logic) ================= */

  // Generic helper to update a filter and reset pagination in one go
  const updateFilter = <T,>(setter: (val: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDelete = useCallback((id: string) => {
    if (window.confirm("Permanently delete this record?")) {
      dispatch(deleteRecord(id));
      toast.success("Record purged from system");
    }
  }, [dispatch]);

  const handleBulkUpdate = useCallback(async () => {
    if (!bulkDate) {
      toast.error("Select forwarding date");
      return;
    }
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
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.message || "Failed to update records");
    }
  }, [bulkDate, selectedIds, dispatch]);

  const handleSelectAll = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setSelectedIds(paginatedRecords.map((r) => r._id));
      } else {
        setSelectedIds([]);
      }
    },
    [paginatedRecords] // Fixed dependency
  );

  const handleSelectRecord = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((recordId) => recordId !== id) : [...prev, id]
    );
  }, []);

  return (
    <div className="p-8 max-w-[1900px] mx-auto space-y-6 bg-slate-50/30 min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#355E3B] tracking-tight uppercase flex items-center gap-3">
            <Database className="text-[#EFBF04]" size={32} />
            Admin Records Vault
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1">
            Institutional Registry Control & Audit
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#355E3B]/10 rounded-xl">
            <Calendar className="text-[#355E3B]" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {sortBy === "leadTime" ? "Sorted by Lead Time" : "Records Count"}
            </p>
            <p className="text-2xl font-black text-[#355E3B]">
              {processedRecords.length.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search Deceased or Cause No..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#355E3B]/10 focus:border-[#355E3B] transition-all"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateFilter(setSearchTerm, e.target.value)}
          />
        </div>

        <div className="relative">
          <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EFBF04]" size={14} />
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#355E3B]/10 focus:border-[#355E3B] transition-all font-bold text-slate-700 appearance-none"
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => updateFilter(setSortBy, e.target.value as SortByType)}
          >
            <option value="date">Newest Received</option>
            <option value="leadTime">Highest Lead Time</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#355E3B]/10 focus:border-[#355E3B] transition-all font-medium text-slate-600 appearance-none"
            value={monthFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => updateFilter(setMonthFilter, e.target.value)}
          >
            <option value="all">All Months</option>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
              <option key={m} value={i.toString()}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <select
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#355E3B]/10 focus:border-[#355E3B] transition-all font-medium text-slate-600"
          value={courtFilter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => updateFilter(setCourtFilter, e.target.value)}
        >
          <option value="">All Court Stations</option>
          {courts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-[#355E3B] text-white px-5 py-2 rounded-xl shadow-lg shadow-[#355E3B]/20 animate-in fade-in slide-in-from-right-4">
            <span className="text-[10px] font-black uppercase tracking-tight">
              {selectedIds.length} Selected
            </span>
            <input
              type="date"
              className="bg-[#2a4b2f] text-white text-xs rounded-lg px-2 py-1.5 border-none outline-none focus:ring-1 focus:ring-[#EFBF04]"
              value={bulkDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBulkDate(e.target.value)}
            />
            <button
              onClick={handleBulkUpdate}
              className="bg-[#EFBF04] text-[#355E3B] text-[10px] font-black uppercase px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Forward to GP
            </button>
            <button onClick={() => setSelectedIds([])} className="text-white/60 hover:text-white">
              <XCircle size={20} />
            </button>
          </div>
        )}
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        <div className="overflow-auto max-h-[calc(100vh-340px)]">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="sticky top-0 z-30 bg-slate-50 px-6 py-6 border-b border-slate-200 text-left">
                  <input
                    type="checkbox"
                    className="accent-[#355E3B] h-4 w-4 rounded"
                    onChange={handleSelectAll}
                    checked={paginatedRecords.length > 0 && selectedIds.length === paginatedRecords.length}
                  />
                </th>
                {["Court Station", "Cause No.", "Deceased Name", "Received", "Receipt Date", "Rec Lead", "To GP", "Fwd Lead", "Status", "Actions"].map((h) => (
                  <th key={h} className="sticky top-0 z-30 bg-slate-50 px-4 py-6 border-b border-slate-200 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.map((r) => (
                <tr key={r._id} className="hover:bg-[#355E3B]/5 transition-colors group">
                  <td className="px-6 py-5 text-center">
                    <input
                      type="checkbox"
                      className="accent-[#355E3B] h-4 w-4 rounded"
                      checked={selectedIds.includes(r._id)}
                      onChange={() => handleSelectRecord(r._id)}
                    />
                  </td>
                  <td className="px-4 py-5 text-xs font-bold text-[#355E3B]">{r.courtStation?.name}</td>
                  <td className="px-4 py-5 text-xs font-mono text-slate-500">{r.causeNo}</td>
                  <td className="px-4 py-5 text-xs font-bold uppercase text-slate-800">{r.nameOfDeceased}</td>
                  <td className="px-4 py-5 text-xs text-slate-600">
                    {new Date(r.dateReceived).toLocaleDateString("en-KE")}
                  </td>
                  <td className="px-4 py-5 text-xs text-slate-600">
                    {r.dateOfReceipt ? new Date(r.dateOfReceipt).toLocaleDateString("en-KE") : "—"}
                  </td>
                  <td className="px-4 py-5 text-xs text-center">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        (r.receivingLeadTime ?? 0) > 7 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.receivingLeadTime ?? 0}d
                    </span>
                  </td>
                  <td className="px-4 py-5 text-xs">
                    {r.dateForwardedToGP ? (
                      <span className="text-emerald-700 font-bold">
                        {new Date(r.dateForwardedToGP).toLocaleDateString("en-KE")}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-black uppercase text-[9px] italic">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-5 text-xs text-center font-bold text-slate-400">
                    {r.forwardingLeadTime ?? "—"}
                  </td>
                  <td className="px-4 py-5 text-xs">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                        String(r.form60Compliance).toLowerCase() === "compliant"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.form60Compliance}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="p-2 text-slate-300 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Page {activePage} / {totalPages || 1}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={activePage === 1}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={activePage === totalPages || totalPages === 0}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 bg-white disabled:opacity-30 flex items-center gap-1"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecordsPage;
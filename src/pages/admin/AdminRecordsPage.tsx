import { useEffect, useState, useMemo } from "react";
import { 
  Database, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  AlertCircle, 
  Calendar 
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchRecords, deleteRecord, clearRecordsError } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const AdminRecordsPage = () => {
  const dispatch = useAppDispatch();
  const { records, loading, error } = useAppSelector((state) => state.records);
  const { courts } = useAppSelector((state) => state.courts);

  // SEARCH & FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    dispatch(fetchRecords());
    dispatch(fetchCourts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearRecordsError()), 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this record?")) {
      dispatch(deleteRecord(id));
    }
  };

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER & TOP STATS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <Database className="text-emerald-600" size={32} />
            Records Management
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            System Administration & Audit Control
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[180px]">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Calendar size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Entries</p>
            <p className="text-xl font-black text-slate-800">{filteredRecords.length}</p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative min-w-[300px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search Deceased or Cause No..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
      </div>

      {/* FEEDBACK */}
      {loading && (
        <div className="flex items-center gap-3 text-emerald-600 animate-pulse font-black text-[10px] uppercase">
          <div className="h-2 w-2 bg-emerald-600 rounded-full" />
          Synchronizing with central vault...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* MAIN TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Station", "Cause No", "Deceased", "Received", "Compliance", "Audit", "Action"].map((head) => (
                  <th key={head} className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${head === 'Action' ? 'text-right' : 'text-left'}`}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentRecords.map((r) => (
                <tr key={r._id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md uppercase">
                      {r.courtStation?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 font-mono">{r.causeNo}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 uppercase">{r.nameOfDeceased}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">
                    {new Date(r.dateReceived).toLocaleDateString("en-KE")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                      r.form60Compliance === "Approved" 
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" 
                        : "bg-red-100 text-red-700 ring-1 ring-red-200"
                    }`}>
                      {r.form60Compliance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.updatedBy ? (
                      <div className="relative group/audit">
                        <button className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                          <Info size={18} />
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/audit:block w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 animate-in zoom-in-95">
                          <div className="space-y-2">
                            <h4 className="text-[9px] font-black text-emerald-400 uppercase border-b border-white/10 pb-2">Edit Audit Log</h4>
                            <p className="text-[10px] leading-relaxed">
                                <span className="text-slate-400 font-bold uppercase mr-1">Officer:</span> 
                                {r.updatedBy.firstName} {r.updatedBy.lastName}
                            </p>
                            <p className="text-[10px] leading-relaxed italic text-slate-300">"{r.lastEditAction || "Manual update"}"</p>
                            <p className="text-[9px] text-slate-500 mt-2 font-mono">{new Date(r.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-200 italic">No history</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={loading}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {currentRecords.length === 0 && !loading && (
            <div className="text-center py-20">
              <Database size={48} className="mx-auto text-slate-100 mb-4" />
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No matching records found</p>
            </div>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-20 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-20 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecordsPage;
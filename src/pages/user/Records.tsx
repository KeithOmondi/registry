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
  MapPin,
  Send,
  AlertCircle,
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
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);

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
      setBulkDate("");
    } catch (err: any) {
      toast.error(err);
    }
  };

  const handleSelectCourt = (courtId: string, courtName: string) => {
    setCourtFilter(courtId);
    setCourtSearch(courtName);
    setShowCourtDropdown(false);
    setCurrentPage(1);
  };

  const handleClearCourt = () => {
    setCourtFilter("");
    setCourtSearch("");
    setShowCourtDropdown(false);
    setCurrentPage(1);
  };

  const handleEditClick = (record: RecordType) => {
    setSelectedRecord(record);
    setEditMode(true);
  };

  return (
    <div className="relative p-4 md:p-8 bg-[#F9F9F7] min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* MODAL OVERLAY */}
      {editMode && selectedRecord && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl">
            <EditRecord 
              record={selectedRecord} 
              onClose={() => { 
                setSelectedRecord(null); 
                setEditMode(false); 
              }} 
            />
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-[1800px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#004832] uppercase tracking-tighter">
            Probate <span className="text-[#C8A239]">Registry</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
            <span className="w-6 h-[2px] bg-[#C8A239]" />
            Lead Time Management Portal
          </p>
        </div>

        <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Records</p>
            <p className="text-xl font-black text-[#004832]">{filteredRecords.length}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Selected</p>
            <p className="text-xl font-black text-[#C8A239]">{selectedIds.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className={`relative flex flex-wrap lg:flex-nowrap items-center gap-3 p-3 rounded-2xl border transition-all duration-500 ${selectedIds.length > 0 ? "bg-[#004832] border-[#004832] shadow-2xl" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="relative flex-1 min-w-[320px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${selectedIds.length > 0 ? "text-white/40" : "text-slate-400"}`} size={18} />
            <input
              type="text"
              placeholder="Search by Deceased or Cause No..."
              className={`w-full pl-12 pr-4 py-3 text-sm font-medium rounded-xl outline-none transition-all ${selectedIds.length > 0 ? "bg-white/10 text-white placeholder:text-white/30 focus:bg-white/20" : "bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#004832]/5"}`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="relative w-full lg:w-80">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none ${selectedIds.length > 0 ? "text-white/40" : "text-slate-400"}`}><MapPin size={16} /></div>
            <input
              type="text"
              placeholder="Select Court Station..."
              className={`w-full pl-12 pr-10 py-3 text-sm font-bold rounded-xl outline-none cursor-pointer transition-all ${selectedIds.length > 0 ? "bg-white/10 text-white placeholder:text-white/30 focus:bg-white/20" : "bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#004832]/5"}`}
              value={courtSearch}
              onFocus={() => setShowCourtDropdown(true)}
              onBlur={() => setTimeout(() => setShowCourtDropdown(false), 200)}
              onChange={(e) => { setCourtSearch(e.target.value); setCourtFilter(""); setShowCourtDropdown(true); }}
            />
            {(courtFilter || courtSearch) && (
              <button type="button" onClick={handleClearCourt} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg transition-all"><XCircle size={16} /></button>
            )}
            {showCourtDropdown && (
              <div className="absolute z-[100] mt-3 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto p-2">
                  <div onMouseDown={(e) => { e.preventDefault(); handleClearCourt(); }} className="px-4 py-3 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 rounded-xl cursor-pointer tracking-widest">View All Stations</div>
                  {courts.filter((c) => c.name.toLowerCase().includes(courtSearch.toLowerCase())).map((c) => (
                    <div key={c._id} onMouseDown={(e) => { e.preventDefault(); handleSelectCourt(c._id, c.name); }} className="px-4 py-3 hover:bg-[#004832] hover:text-white rounded-xl cursor-pointer text-sm font-bold transition-all mb-1">{c.name}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/20 animate-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#C8A239] uppercase tracking-tighter">Action Date</span>
                <input type="date" className="bg-white/10 text-white text-xs rounded-lg px-3 py-1.5 border border-white/10 outline-none focus:border-[#C8A239]" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
              </div>
              <button onClick={handleBulkUpdate} className="bg-[#C8A239] hover:bg-white text-[#004832] text-[10px] font-black uppercase px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"><Send size={14} /> Forward to GP</button>
              <button onClick={() => setSelectedIds([])} className="p-2 text-white/40 hover:text-white transition-colors"><XCircle size={22} /></button>
            </div>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="max-w-[1800px] mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1700px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-slate-100">
                <th className="p-6 text-center w-16">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded-lg border-slate-300 text-[#004832] focus:ring-[#004832] cursor-pointer"
                    onChange={(e) => e.target.checked ? setSelectedIds(currentRecords.map((r) => r._id)) : setSelectedIds([])}
                  />
                </th>
                <th className="p-6">Court Station</th>
                <th className="p-6">Cause No.</th>
                <th className="p-6">Name of Deceased</th>
                <th className="p-6">Date Received (PR)</th>
                <th className="p-6 text-center">Rec. Lead Time</th>
                <th className="p-6">Forwarded to GP</th>
                <th className="p-6 text-center">Fwd. Lead Time</th>
                <th className="p-6">Compliance</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentRecords.map((r) => (
                <tr key={r._id} className="hover:bg-[#F9F9F7] transition-all group/row">
                  <td className="p-6 text-center">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-slate-300 text-[#004832] focus:ring-[#004832] cursor-pointer"
                      checked={selectedIds.includes(r._id)}
                      onChange={() => setSelectedIds((prev) => prev.includes(r._id) ? prev.filter((id) => id !== r._id) : [...prev, r._id])}
                    />
                  </td>
                  <td className="p-6"><span className="text-[#004832] font-black text-xs">{r.courtStation?.name}</span></td>
                  <td className="p-6"><code className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[11px] font-bold">{r.causeNo}</code></td>
                  <td className="p-6 font-black uppercase text-slate-800 tracking-tight">{r.nameOfDeceased}</td>
                  <td className="p-6 font-bold text-slate-500 text-xs">{new Date(r.dateReceived).toLocaleDateString("en-KE")}</td>
                  
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full font-black text-[10px] ${(r.receivingLeadTime ?? 0) > 30 ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                      {r.receivingLeadTime ?? 0} Days
                    </span>
                  </td>

                  <td className="p-6">
                    {r.dateForwardedToGP ? (
                      <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs"><CheckCircle2 size={14} /> {new Date(r.dateForwardedToGP).toLocaleDateString("en-KE")}</span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic"><Clock size={12} /> Pending</span>
                    )}
                  </td>

                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full font-black text-[10px] ${(r.forwardingLeadTime ?? 0) > 30 ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-400"}`}>
                      {r.forwardingLeadTime ?? "—"} {r.forwardingLeadTime ? "Days" : ""}
                    </span>
                  </td>

                  {/* COMPLIANCE COLUMN WITH REJECTION REASON */}
                  <td className="p-6">
                    <div className="relative group/reason flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 ${r.form60Compliance === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {r.form60Compliance === "Approved" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {r.form60Compliance}
                      </span>
                      
                      {r.form60Compliance !== "Approved" && r.rejectionReason && (
                        <div className="relative">
                          <AlertCircle size={14} className="text-red-400 cursor-help" />
                          {/* Tooltip for Rejection Reason */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/reason:block w-48 bg-slate-900 text-white text-[10px] p-3 rounded-xl shadow-xl z-[100]">
                            <p className="font-black text-[#C8A239] uppercase mb-1 tracking-widest">Rejection Reason</p>
                            <p className="font-medium text-slate-300 leading-relaxed">{r.rejectionReason}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditClick(r)} className="p-3 bg-white hover:bg-[#004832] text-[#004832] hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100">
                        <Edit3 size={16} />
                      </button>
                      <div className="relative group/audit">
                        <button className="p-3 bg-white text-slate-400 hover:text-slate-800 rounded-2xl transition-all border border-slate-100"><Info size={16} /></button>
                        <div className="absolute bottom-full right-0 mb-4 hidden group-hover/audit:block w-72 bg-[#1a1a1a] text-white p-5 rounded-[2rem] shadow-2xl z-[150] border border-white/10 backdrop-blur-md">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <h4 className="text-[10px] font-black text-[#C8A239] uppercase tracking-[0.2em]">Audit Log</h4>
                              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="flex justify-between text-[11px]"><span className="text-slate-500 uppercase font-black text-[9px]">Officer</span><span className="font-bold">{r.updatedBy?.firstName} {r.updatedBy?.lastName}</span></div>
                            <div className="grid grid-cols-2 gap-4 pt-1 text-[10px]">
                              <div><span className="text-slate-500 uppercase font-black text-[8px] block mb-1">Date</span>{new Date(r.updatedAt).toLocaleDateString("en-KE")}</div>
                              <div className="text-right"><span className="text-slate-500 uppercase font-black text-[8px] block mb-1">Time</span>{new Date(r.updatedAt).toLocaleTimeString("en-KE")}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-end gap-4 p-6">
          <button className="p-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-50" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
          <span className="text-sm font-bold text-slate-500">Page {currentPage} of {totalPages || 1}</span>
          <button className="p-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-50" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;
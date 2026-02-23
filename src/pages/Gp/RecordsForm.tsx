/* =====================================
    UPDATED HYBRID RECORDS FORM PAGE
===================================== */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Loader2, 
  ChevronDown, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  X,
  Edit3 // Added for visual feedback
} from "lucide-react";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import {
  resetGpStatus,
  submitRejectionRecord,
  lookupDeceasedName,
} from "../../store/slices/gpSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const RecordsFormPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { loading, error, success, lookupResult, loadingLookup } = useSelector(
    (state: RootState) => state.gp,
  );
  const { courts, loading: courtsLoading } = useSelector(
    (state: RootState) => state.courts,
  );

  const today = new Date().toISOString().split("T")[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [courtSearch, setCourtSearch] = useState("");

  const [formData, setFormData] = useState({
    causeNo: "",
    deceasedName: "",
    rejectionReason: "",
    dateOfRejection: today,
    courtStation: "",
  });

  useEffect(() => {
    dispatch(fetchCourts());
    dispatch(resetGpStatus());
  }, [dispatch]);

  // Automatic insertion from lookup
  useEffect(() => {
    if (lookupResult) {
      setFormData((prev) => ({ ...prev, deceasedName: lookupResult }));
      toast.success("Record found in court database", { icon: "🔍" });
    }
  }, [lookupResult]);

  useEffect(() => {
    const { causeNo, courtStation } = formData;
    if (causeNo.length < 3 || !courtStation) return;

    const delayDebounceFn = setTimeout(() => {
      dispatch(lookupDeceasedName({ causeNo, courtStation }));
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.causeNo, formData.courtStation, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Record Archiving Successful");
      setFormData({
        causeNo: "",
        deceasedName: "",
        rejectionReason: "",
        dateOfRejection: today,
        courtStation: "",
      });
      setFile(null);
      dispatch(resetGpStatus());
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch, today]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCourts = useMemo(
    () => courts.filter((court) => 
      court.name.toLowerCase().includes(courtSearch.toLowerCase())
    ),
    [courts, courtSearch]
  );

  const selectedCourt = useMemo(
    () => courts.find((c) => c._id === formData.courtStation),
    [courts, formData.courtStation]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "causeNo" ? value.toUpperCase() : value,
    }));
  };

  const handleSelectCourt = (id: string) => {
    setFormData((prev) => ({ ...prev, courtStation: id, deceasedName: "" }));
    setIsDropdownOpen(false);
    setCourtSearch("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      toast.success(`Proof attached: ${selected.name.substring(0, 15)}...`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courtStation) return toast.error("Please select a court station");
    // Updated validation: Ensure name exists, whether manual or automatic
    if (!formData.deceasedName.trim()) return toast.error("Deceased Name is required");
    
    dispatch(submitRejectionRecord({ ...formData, file }));
  };

  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold transition-all focus:bg-white focus:border-[#013220] focus:ring-4 focus:ring-emerald-50 outline-none placeholder:text-slate-300";
  const labelBase = "text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2 ml-1";

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border overflow-hidden">
          
          <div className="bg-[#013220] p-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-black italic">
                FILE <span className="text-emerald-500 not-italic">REJECTION</span>
              </h2>
              <p className="text-emerald-100/60 text-xs font-bold mt-2 uppercase tracking-[0.2em]">
                GP Administration Portal • Official Entry
              </p>
            </div>
            <FileText className="absolute -right-10 -bottom-10 w-64 h-64 text-emerald-900/20 rotate-12" />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div ref={dropdownRef} className="relative">
                <label className={labelBase}>Originating Court</label>
                <button
                  type="button"
                  disabled={courtsLoading}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`${inputBase} flex justify-between items-center ${formData.courtStation ? "text-slate-900" : "text-slate-400"}`}
                >
                  <span className="truncate">{selectedCourt?.name || "Select Court Station"}</span>
                  {courtsLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-3 sticky top-0 bg-white border-b border-slate-100 z-10 flex items-center gap-2">
                      <Search size={14} className="text-slate-400 ml-2" />
                      <input 
                        placeholder="Search stations..." 
                        autoFocus
                        className="w-full py-2 text-xs font-bold outline-none"
                        onChange={(e) => setCourtSearch(e.target.value)}
                        value={courtSearch}
                      />
                      {courtSearch && (
                        <button onClick={() => setCourtSearch("")}><X size={14} className="text-slate-400 hover:text-rose-500" /></button>
                      )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto overflow-x-hidden bg-white py-2 scroll-smooth">
                      {filteredCourts.length > 0 ? (
                        filteredCourts.map((court) => (
                          <button
                            key={court._id}
                            type="button"
                            onClick={() => handleSelectCourt(court._id)}
                            className="w-full text-left px-5 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-emerald-50 hover:text-[#013220] transition-colors border-b border-slate-50 last:border-0"
                          >
                            {court.name}
                          </button>
                        ))
                      ) : (
                        <div className="p-10 text-center text-slate-400 text-xs font-bold">No matches found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className={labelBase}>Cause Identification</label>
                <input
                  name="causeNo"
                  value={formData.causeNo}
                  onChange={handleChange}
                  required
                  placeholder="E.G. P&A 123/2024"
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelBase}>Deceased Name (Auto-fill or Manual)</label>
                <div className="relative">
                  <input
                    name="deceasedName"
                    value={formData.deceasedName}
                    onChange={handleChange}
                    placeholder={loadingLookup ? "Verifying..." : "Enter name or wait for lookup"}
                    className={`${inputBase} ${formData.deceasedName && !loadingLookup ? "bg-emerald-50/50 border-emerald-100" : ""}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
  {loadingLookup ? (
    <Loader2 size={18} className="animate-spin text-emerald-600" />
  ) : lookupResult && formData.deceasedName === lookupResult ? (
    <span title="Verified by system">
      <CheckCircle2 size={18} className="text-emerald-500" />
    </span>
  ) : formData.deceasedName ? (
    <span title="Manual Entry">
      <Edit3 size={18} className="text-amber-500" />
    </span>
  ) : (
    <AlertCircle size={18} className="text-slate-300" />
  )}
</div>
                </div>
              </div>

              <div>
                <label className={labelBase}>Date Received</label>
                <input
                  type="date"
                  name="dateOfRejection"
                  value={formData.dateOfRejection}
                  onChange={handleChange}
                  required
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className={labelBase}>Reason for Rejection</label>
              <textarea
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                required
                placeholder="Describe why this record is being returned..."
                className={`${inputBase} min-h-[120px] resize-none`}
              />
            </div>

            <div className="group relative">
              <label className={labelBase}>Proof of Rejection (Optional)</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-white hover:border-emerald-300 transition-all">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 font-bold">
                    {file ? file.name : "Click to upload document (PDF/Image)"}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || loadingLookup || !formData.deceasedName.trim()}
              className={`w-full py-5 rounded-2xl text-white font-black tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] ${
                loading || !formData.deceasedName.trim()
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> PROCESSING...
                </span>
              ) : "Submit Rejection"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecordsFormPage;
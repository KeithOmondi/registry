import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ShieldCheck,
  Building2,
  UploadCloud,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Search,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import {
  resetGpStatus,
  submitRejectionRecord,
} from "../../store/slices/gpSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";

const RecordsFormPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector(
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      dispatch(resetGpStatus());
    }
  }, [success, error, dispatch, today]);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) =>
      court.name.toLowerCase().includes(courtSearch.toLowerCase()),
    );
  }, [courts, courtSearch]);

  const selectedCourt = useMemo(() => {
    return courts.find((c) => c._id === formData.courtStation);
  }, [courts, formData.courtStation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "causeNo" ? value.toUpperCase() : value,
    }));
  };

  const handleSelectCourt = (id: string) => {
    setFormData((prev) => ({ ...prev, courtStation: id }));
    setIsDropdownOpen(false);
    setCourtSearch("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    toast.success(`${selected.name} attached`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Document proof required");
    if (!formData.courtStation)
      return toast.error("Please select a court station");

    dispatch(submitRejectionRecord({ ...formData, file }));
  };

  // Shared Input Styles
  const inputBase =
    "w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold transition-all focus:bg-white focus:border-[#013220] focus:ring-4 focus:ring-emerald-50 outline-none placeholder:text-slate-300";
  const labelBase =
    "text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2 ml-1";

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-950/5 border border-white overflow-hidden">
          {/* MODERN HEADER */}
          <div className="bg-[#013220] p-10 md:p-14 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80">
                  Justice Sector Records Management
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic">
                FILE{" "}
                <span className="text-emerald-500 not-italic">REJECTION</span>
              </h2>
              <p className="text-slate-400 text-xs mt-4 max-w-md font-medium leading-relaxed">
                Log formal rejections into the Government Printer Ledger. Ensure
                all metadata matches the physical file.
              </p>
            </div>
            {/* Abstract Background Decoration */}
            <Building2
              className="absolute -right-16 -bottom-16 text-white/5 rotate-12"
              size={320}
            />
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {/* GRID SECTION 1: IDENTITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div ref={dropdownRef} className="relative">
                <label className={labelBase}>
                  <Building2 size={14} /> Originating Court
                </label>
                <button
                  type="button"
                  onClick={() =>
                    !courtsLoading && setIsDropdownOpen(!isDropdownOpen)
                  }
                  className={`${inputBase} flex justify-between items-center ${isDropdownOpen ? "border-[#013220] bg-white" : ""}`}
                >
                  <span
                    className={
                      selectedCourt ? "text-slate-900" : "text-slate-400"
                    }
                  >
                    {courtsLoading
                      ? "Synchronizing Stations..."
                      : selectedCourt?.name || "Select Court Station"}
                  </span>
                  {courtsLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-slate-50 border-b flex items-center gap-2">
                      <Search size={16} className="text-slate-400" />
                      <input
                        autoFocus
                        value={courtSearch}
                        onChange={(e) => setCourtSearch(e.target.value)}
                        placeholder="Filter stations..."
                        className="bg-transparent w-full outline-none text-xs font-bold py-1"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCourts.length > 0 ? (
                        filteredCourts.map((court) => (
                          <button
                            key={court._id}
                            type="button"
                            onClick={() => handleSelectCourt(court._id)}
                            className="w-full text-left px-5 py-3 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between group"
                          >
                            {court.name}
                            {formData.courtStation === court._id && (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-600"
                              />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-10 text-center text-slate-400 text-xs italic">
                          No stations found matching "{courtSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelBase}>
                  <FileText size={14} /> Cause Identification
                </label>
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

            {/* GRID SECTION 2: SUBJECT & DATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>
                  <User size={14} /> Deceased Name
                </label>
                <input
                  name="deceasedName"
                  value={formData.deceasedName}
                  onChange={handleChange}
                  required
                  placeholder="Full Legal Name"
                  className={inputBase}
                />
              </div>

              <div>
                <label className={labelBase}>
                  <Calendar size={14} /> Date of Entry
                </label>
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

            {/* REJECTION REASON */}
            <div>
              <label className={labelBase}>
                <AlertCircle size={14} /> Formal Reason for Rejection
              </label>
              <textarea
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                required
                placeholder="Detail the specific grounds for file rejection..."
                className={`${inputBase} min-h-[120px] resize-none`}
              />
            </div>

            {/* UPLOAD AREA */}
            <div>
              <label className={labelBase}>
                <UploadCloud size={14} /> Supporting Evidence
              </label>
              <div
                className={`relative group border-2 border-dashed rounded-3xl transition-all p-8 flex flex-col items-center justify-center gap-4
                ${file ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50 hover:border-[#013220] hover:bg-white"}`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  required={!file}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {file ? (
                  <div className="flex flex-col items-center text-center animate-in zoom-in-95">
                    <div className="p-4 bg-emerald-500 text-white rounded-full mb-2">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-sm font-black text-slate-800">
                      {file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2 text-[10px] font-black uppercase text-rose-600 hover:underline"
                    >
                      Remove and Replace
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-white shadow-sm rounded-2xl text-slate-400 group-hover:text-emerald-700 transition-colors">
                      <UploadCloud size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-600">
                        Click or drag rejection notice
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-1">
                        PDF or Scanned Image (Max 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || !file}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-3
                ${
                  loading || !file
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-rose-700 text-white hover:bg-rose-800 shadow-rose-900/20"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Transmitting
                  Data...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Authorize & Post Rejection
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <AlertCircle size={12} /> Confidential Government Document Interface
        </p>
      </div>
    </div>
  );
};

export default RecordsFormPage;

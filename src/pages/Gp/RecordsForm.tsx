import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Upload,
  Loader2,
  X,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import type { AppDispatch, RootState } from "../../store/store";
import {
  resetGpStatus,
  submitRejectionRecord,
} from "../../store/slices/gpSlice";

const RecordsFormPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.gp,
  );

  const todayRef = useRef(new Date().toISOString().split("T")[0]);

  const [formData, setFormData] = useState({
    causeNo: "",
    rejectionReason: "",
    dateOfRejection: todayRef.current,
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(resetGpStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Record submitted successfully!", { icon: "🏛️" });
      setFormData({
        causeNo: "",
        rejectionReason: "",
        dateOfRejection: todayRef.current,
      });
      setFile(null);
      dispatch(resetGpStatus());
    }
    if (error) {
      toast.error(error);
      dispatch(resetGpStatus());
    }
  }, [success, error, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value =
      e.target.name === "causeNo"
        ? e.target.value.toUpperCase()
        : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid format! Only PDF, JPG, PNG allowed.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit.");
      return;
    }
    setFile(selectedFile);
    toast.success("File attached", { icon: "📎" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a supporting document.");
      return;
    }
    dispatch(submitRejectionRecord({ ...formData, file }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-10 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* EXECUTIVE HEADER */}
        <div className="bg-[#013220] p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg backdrop-blur-md">
                <ShieldCheck className="text-emerald-400" size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80">
                Compliance Division
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              ADD <span className="text-emerald-400">RECORD</span>
            </h2>
            <p className="text-slate-300/70 text-xs font-bold mt-2 uppercase tracking-widest">
              GOVERNMENT PRINTER FEEDBACK FORM
            </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* FORM SECTION */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cause Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                <Hash size={14} className="text-emerald-600" /> Cause Number
              </label>
              <input
                required
                name="causeNo"
                value={formData.causeNo}
                onChange={handleChange}
                placeholder="E.G. E123 OF 2024"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-[#013220] focus:bg-white focus:ring-4 focus:ring-[#013220]/5 transition-all outline-none placeholder:text-slate-300"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                <Calendar size={14} className="text-emerald-600" /> Rejection
                Date
              </label>
              <input
                required
                type="date"
                name="dateOfRejection"
                value={formData.dateOfRejection}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-[#013220] focus:bg-white focus:ring-4 focus:ring-[#013220]/5 transition-all outline-none"
              />
            </div>
          </div>

          {/* Reason TextArea */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
              <FileText size={14} className="text-emerald-600" /> Reason for
              Rejection
            </label>
            <textarea
              required
              rows={4}
              name="rejectionReason"
              value={formData.rejectionReason}
              onChange={handleChange}
              placeholder="Provide specific details regarding the compliance failure..."
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:border-[#013220] focus:bg-white focus:ring-4 focus:ring-[#013220]/5 transition-all outline-none resize-none placeholder:text-slate-300 leading-relaxed"
            />
          </div>

          {/* DRAG & DROP FILE UPLOAD */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
              <Upload size={14} className="text-emerald-600" /> Supporting
              Evidence
            </label>

            <div className="relative group">
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileChange}
              />

              <label
                htmlFor="fileUpload"
                className={`flex flex-col items-center justify-center w-full py-10 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer 
                ${
                  file
                    ? "border-emerald-500 bg-emerald-50/30"
                    : "border-slate-200 bg-slate-50/50 hover:border-[#013220] hover:bg-white"
                }`}
              >
                {file ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3">
                      <FileCheck size={32} />
                    </div>
                    <p className="text-sm font-black text-emerald-900 px-4 text-center truncate max-w-xs">
                      {file.name}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase mt-1 tracking-widest">
                      Click to replace file
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-[#013220] transition-colors">
                    <Upload size={40} strokeWidth={1.5} className="mb-3" />
                    <p className="text-sm font-bold">Drop documentation here</p>
                    <span className="text-[10px] font-medium mt-1">
                      PDF, JPG or PNG (Up to 10MB)
                    </span>
                  </div>
                )}
              </label>

              {file && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full text-rose-500 shadow-md hover:bg-rose-500 hover:text-white transition-all border border-slate-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#013220]/10
              ${
                loading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-[#013220] text-white hover:bg-[#0a4730] hover:-translate-y-1 active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Finalize & Record <AlertCircle size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* FOOTER NOTE */}
      <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Confidential Document Submission • ID:{" "}
        {Math.random().toString(36).substring(7).toUpperCase()}
      </p>
    </div>
  );
};

export default RecordsFormPage;

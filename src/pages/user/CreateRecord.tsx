import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  createRecord,
  clearRecordsError,
  type Court,
  type Form60Compliance,
} from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

/* ================================
   CONSTANTS & STYLES
================================ */

const rejectionReasons = [
  "No Stamp or Seal/Note Dated",
  "Conflicting Case Number between the E Citizen Print Receipt and the Form 60 Notice",
  "Lack of Deputy and or District Registrars' Signature and Name",
  "Prepare a corrigenda",
  "Proof of gazette fees payment not attached NO receipt attached",
  "No Case Number on Form 60 and/or Government Printer Receipt",
  "Lack of Petitioner(s) name and or deceased name in the Form 60 Notice",
  "Attach original bankslip and not a photocopy unless paid via ECitizen platform",
  "Same deceased details in two different case numbers within submitted Notices from the Station",
  "Not indicating whether the matter is testate or intestate",
  "Same case number with two different petitioners and or deceased names",
  "Deputy registrar and or District Registrar name not typed",
  "Receipt mismatch/wrong receipt",
  "Bankers’ cheques be addressed to Government Printers and not Kenya Gazette",
  "Altered Form 60 Notice",
  "One deceased per petition",
  "Different Court Stations in one Form 60 notice",
  "Form 60 Notice missing the date of Death of the Deceased Persons",
  "Rejected from the Govt. Printers due to being sent directly to their offices",
  "Attach the original Form 60 notice NOT a copy",
  "Form 60 notice without a receipt",
  "Duplicate/Photocopy of Form 60",
  "FORM 60 missing",
  "Two Deceased in one Form 60",
  "Kindly confirm the deceased name",
];

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: "0.75rem",
    padding: "3px",
    borderColor: state.isFocused ? "#10B981" : "#E2E8F0",
    boxShadow: state.isFocused ? "0 0 0 1px #10B981" : "none",
    "&:hover": { borderColor: "#10B981" },
    fontSize: "0.875rem",
    backgroundColor: "white",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#1a3a32"
      : state.isFocused
        ? "#F0FDF4"
        : "white",
    color: state.isSelected ? "white" : "#1a3a32",
    cursor: "pointer",
  }),
};

// Reusable Tailwind Class for Inputs
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm";
const labelClass =
  "text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1 mb-1 block";

/* ================================
   COMPONENT
================================ */

const CreateRecordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error } = useSelector((s: RootState) => s.records);
  const { courts, loading: courtsLoading } = useSelector(
    (s: RootState) => s.courts,
  );

  const [formData, setFormData] = useState({
    courtStation: null as Court | null,
    causeNo: "",
    nameOfDeceased: "",
    dateReceived: "",
    dateOfReceipt: "",
    dateForwardedToGP: "",
    form60Compliance: "Approved" as Form60Compliance,
    rejectionReason: "",
    customRejection: "",
    leadTime: 0,
  });

  useEffect(() => {
    if (!courts.length) dispatch(fetchCourts());
  }, [courts.length, dispatch]);

  const courtOptions = useMemo(
    () => courts.map((c) => ({ value: c, label: c.name })),
    [courts],
  );

  // Calculation for Lead Time Visibility
  useEffect(() => {
    if (!formData.dateReceived) return;
    const start = new Date(formData.dateReceived);
    if (isNaN(start.getTime())) return;
    let diff = 0;
    if (formData.dateOfReceipt) {
      const end = new Date(formData.dateOfReceipt);
      if (!isNaN(end.getTime())) {
        diff = Math.max(
          0,
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        );
      }
    }
    setFormData((p) => ({ ...p, leadTime: diff }));
  }, [formData.dateReceived, formData.dateOfReceipt]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearRecordsError());

    const {
      courtStation,
      causeNo,
      nameOfDeceased,
      dateReceived,
      dateOfReceipt,
      dateForwardedToGP,
      form60Compliance,
      rejectionReason,
      customRejection,
    } = formData;

    if (!courtStation || !causeNo || !nameOfDeceased || !dateReceived) {
      toast.error("⚠️ Please fill all required fields");
      return;
    }

    let finalRejection: string | undefined;
    if (form60Compliance === "Rejected") {
      finalRejection =
        rejectionReason === "Other" ? customRejection.trim() : rejectionReason;
      if (!finalRejection) {
        toast.error("⚠️ Rejection reason required");
        return;
      }
    }

    try {
      await dispatch(
        createRecord({
          courtStation: courtStation._id,
          causeNo,
          nameOfDeceased,
          dateReceived,
          ...(dateOfReceipt && { dateOfReceipt }),
          ...(dateForwardedToGP && { dateForwardedToGP }),
          form60Compliance,
          ...(finalRejection && { rejectionReason: finalRejection }),
        }),
      ).unwrap();

      toast.success("✅ Record created successfully");
      setFormData({
        courtStation: null,
        causeNo: "",
        nameOfDeceased: "",
        dateReceived: "",
        dateOfReceipt: "",
        dateForwardedToGP: "",
        form60Compliance: "Approved",
        rejectionReason: "",
        customRejection: "",
        leadTime: 0,
      });
    } catch {
      toast.error("❌ Failed to create record");
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Judicial Header */}
          <div className="bg-[#1a3a32] p-8 text-white relative">
            <div className="relative z-10">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                New Court Record
              </h2>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">
                Principal Registry Entry Portal
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Station Selection */}
              <div className="md:col-span-2">
                <label className={labelClass}>Court Station *</label>
                <Select
                  options={courtOptions}
                  styles={selectStyles}
                  isLoading={courtsLoading}
                  placeholder="Search and select court station..."
                  value={
                    formData.courtStation
                      ? {
                          value: formData.courtStation,
                          label: formData.courtStation.name,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData((p) => ({
                      ...p,
                      courtStation: opt ? opt.value : null,
                    }))
                  }
                />
              </div>

              {/* Cause No & Deceased */}
              <div>
                <label className={labelClass}>Cause Number *</label>
                <input
                  name="causeNo"
                  value={formData.causeNo}
                  onChange={handleChange}
                  placeholder="e.g., E123 of 2024 OR E123OF2020"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Name of Deceased *</label>
                <input
                  name="nameOfDeceased"
                  value={formData.nameOfDeceased}
                  onChange={handleChange}
                  placeholder="FULL LEGAL NAME"
                  className={`${inputClass} uppercase font-medium`}
                  required
                />
              </div>

              {/* Dates */}
              <div>
                <label className={labelClass}>
                  Date Received at Registry *
                </label>
                <input
                  type="date"
                  name="dateReceived"
                  value={formData.dateReceived}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Date of Receipt (e-Citizen)
                </label>
                <input
                  type="date"
                  name="dateOfReceipt"
                  value={formData.dateOfReceipt}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* KPI Alert Section */}
              <div className="md:col-span-1">
                <label className={labelClass}>Lead Time Benchmark</label>
                <div
                  className={`px-4 py-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    formData.leadTime > 30
                      ? "bg-red-50 border-red-200 text-red-700 shadow-inner"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="text-sm font-bold">
                    {formData.leadTime} Days
                  </span>
                  {formData.leadTime > 30 && (
                    <span className="text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">
                      KPI Delay
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Date Forwarded to G.P.</label>
                <input
                  type="date"
                  name="dateForwardedToGP"
                  value={formData.dateForwardedToGP}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Compliance Status */}
            <div className="pt-6 border-t border-slate-100">
              <label className={labelClass}>Compliance Verdict</label>
              <div className="flex gap-4">
                {["Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        form60Compliance: status as Form60Compliance,
                      }))
                    }
                    className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all border ${
                      formData.form60Compliance === status
                        ? status === "Approved"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/10"
                          : "bg-red-50 border-red-500 text-red-700 ring-4 ring-red-500/10"
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Reasons Overlay */}
            {formData.form60Compliance === "Rejected" && (
              <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
                  Primary Rejection Reason
                </label>
                <Select
                  styles={selectStyles}
                  options={[
                    ...rejectionReasons.map((r) => ({ value: r, label: r })),
                    { value: "Other", label: "Other (Manual Entry)" },
                  ]}
                  onChange={(opt) =>
                    setFormData((p) => ({
                      ...p,
                      rejectionReason: opt?.value || "",
                      customRejection: "",
                    }))
                  }
                />
                {formData.rejectionReason === "Other" && (
                  <input
                    name="customRejection"
                    value={formData.customRejection}
                    onChange={handleChange}
                    placeholder="Type custom rejection details..."
                    className={`${inputClass} border-red-200 bg-white`}
                    required
                  />
                )}
              </div>
            )}

            {/* Submission Action */}
            <button
              disabled={loading}
              className="w-full bg-[#1a3a32] hover:bg-[#122923] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Commit Record to Registry"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRecordPage;

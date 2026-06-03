import React, { useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  previewScan,
  confirmScan,
  toggleSelectedId,
  selectAllIds,
  clearSelectedIds,
  resetScanner,
} from "../../store/slices/scannerSlice";
import type { MatchedRecord } from "../../store/slices/scannerSlice";
import toast, { Toaster } from "react-hot-toast";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Send,
  BookOpen,
  Loader2,
  Info,
  ClipboardCheck,
} from "lucide-react";

/* =========================================================
   STEP INDICATOR
========================================================= */
const steps = ["Upload Gazette", "Review Matches", "Confirmed"];

const StepIndicator: React.FC<{ current: 0 | 1 | 2 }> = ({ current }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all
              ${
                i < current
                  ? "bg-[#004832] text-white"
                  : i === current
                  ? "bg-[#C8A239] text-white shadow-lg shadow-[#C8A239]/30"
                  : "bg-slate-100 text-slate-400"
              }`}
          >
            {i < current ? <CheckCircle2 size={18} /> : i + 1}
          </div>
          <span
            className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap
              ${i === current ? "text-[#004832]" : "text-slate-400"}`}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`flex-1 h-[2px] mx-2 mb-5 transition-all
              ${i < current ? "bg-[#004832]" : "bg-slate-200"}`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

/* =========================================================
   STEP 0 — UPLOAD
========================================================= */
const UploadStep: React.FC<{
  onFileSelect: (file: File) => void;
  loading: boolean;
  error: string | null;
}> = ({ onFileSelect, loading, error }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted");
        return;
      }
      setSelectedFile(file);
    },
    []
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full max-w-2xl border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center gap-5 cursor-pointer transition-all
          ${
            dragging
              ? "border-[#C8A239] bg-[#C8A239]/5 scale-[1.01]"
              : selectedFile
              ? "border-[#004832] bg-[#004832]/5"
              : "border-slate-200 bg-slate-50 hover:border-[#004832]/40 hover:bg-white"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <>
            <div className="w-16 h-16 bg-[#004832] rounded-2xl flex items-center justify-center shadow-lg">
              <FileText size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="font-black text-[#004832] text-lg">
                {selectedFile.name}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to
                change
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
              <Upload size={28} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="font-black text-slate-600 text-lg">
                Drop the Kenya Gazette PDF here
              </p>
              <p className="text-slate-400 text-sm mt-1">
                or click to browse — PDF only, max 50MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl text-sm font-bold max-w-2xl w-full">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Scan Button */}
      <button
        disabled={!selectedFile || loading}
        onClick={() => selectedFile && onFileSelect(selectedFile)}
        className="flex items-center gap-3 bg-[#004832] hover:bg-[#003526] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest text-sm px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[#004832]/20 disabled:shadow-none"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Scanning PDF...
          </>
        ) : (
          <>
            <BookOpen size={18} />
            Scan Gazette
          </>
        )}
      </button>
    </div>
  );
};

/* =========================================================
   STEP 1 — PREVIEW / REVIEW
========================================================= */
const PreviewStep: React.FC<{
  onConfirm: () => void;
  onReset: () => void;
  confirmLoading: boolean;
}> = ({ onConfirm, onReset, confirmLoading }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { preview, selectedIds } = useSelector(
    (state: RootState) => state.scanner
  );

  if (!preview) return null;

  const { matched, alreadyPublished, notInGazette, summary } =
    preview;
  const allMatchedIds = matched.map((r) => r._id);
  const allSelected =
    allMatchedIds.length > 0 &&
    allMatchedIds.every((id) => selectedIds.includes(id));

  const handleToggleAll = () => {
    if (allSelected) {
      dispatch(clearSelectedIds());
    } else {
      dispatch(selectAllIds(allMatchedIds));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "In Gazette",
            value: summary.totalInGazette,
            color: "text-slate-800",
            bg: "bg-slate-50",
          },
          {
            label: "New Matches",
            value: summary.totalMatched,
            color: "text-[#004832]",
            bg: "bg-emerald-50",
          },
          {
            label: "Already Published",
            value: summary.totalAlreadyPublished,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Not in DB",
            value: summary.totalNotInDb,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Not in Gazette",
            value: summary.totalNotInGazette,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} rounded-2xl p-5 flex flex-col gap-1`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {label}
            </span>
            <span className={`text-3xl font-black ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Matched Records Table */}
      {matched.length > 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-black text-[#004832] uppercase tracking-tighter text-lg">
                Matched Records
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Select records to mark as Published
              </p>
            </div>
            <span className="bg-[#004832] text-white text-xs font-black px-4 py-1.5 rounded-full">
              {selectedIds.length} / {matched.length} selected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-slate-100">
                  <th className="p-5 text-center w-14">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleAll}
                      className="w-5 h-5 rounded-lg border-slate-300 text-[#004832] focus:ring-[#004832] cursor-pointer"
                    />
                  </th>
                  <th className="p-5 text-left">Cause No.</th>
                  <th className="p-5 text-left">Deceased</th>
                  <th className="p-5 text-left">Court</th>
                  <th className="p-5 text-center">Current Status</th>
                  <th className="p-5 text-center">New Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {matched.map((record: MatchedRecord) => {
                  const isSelected = selectedIds.includes(record._id);
                  return (
                    <tr
                      key={record._id}
                      onClick={() => dispatch(toggleSelectedId(record._id))}
                      className={`cursor-pointer transition-all
                        ${
                          isSelected
                            ? "bg-emerald-50/60"
                            : "hover:bg-slate-50/60"
                        }`}
                    >
                      <td className="p-5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            dispatch(toggleSelectedId(record._id))
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded-lg border-slate-300 text-[#004832] focus:ring-[#004832] cursor-pointer"
                        />
                      </td>
                      <td className="p-5">
                        <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[11px] font-bold">
                          {record.causeNo}
                        </code>
                      </td>
                      <td className="p-5 font-black uppercase text-slate-800 tracking-tight text-xs">
                        {record.nameOfDeceased}
                      </td>
                      <td className="p-5">
                        <span className="text-[#004832] font-black text-xs">
                          {record.courtStation}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {record.previousStatus}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-1.5 w-fit mx-auto">
                          <CheckCircle2 size={10} />
                          {record.newStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 flex items-center gap-4">
          <Info size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="font-black text-amber-700 text-sm">
              No new matches found
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              All cause numbers in this gazette are either already published or
              not in the database.
            </p>
          </div>
        </div>
      )}

      {/* Already Published — collapsible info */}
      {alreadyPublished.length > 0 && (
        <details className="bg-blue-50 border border-blue-100 rounded-2xl p-6 cursor-pointer group">
          <summary className="flex items-center gap-3 font-black text-blue-700 text-sm uppercase tracking-widest list-none">
            <Info size={16} className="shrink-0" />
            {alreadyPublished.length} Already Published (no action needed)
            <ChevronRight
              size={14}
              className="ml-auto group-open:rotate-90 transition-transform"
            />
          </summary>
          <ul className="mt-4 space-y-2">
            {alreadyPublished.map((r) => (
              <li
                key={r._id}
                className="flex items-center justify-between text-xs font-bold text-blue-600"
              >
                <code className="bg-white px-2 py-0.5 rounded font-bold">
                  {r.causeNo}
                </code>
                <span className="text-slate-500">{r.nameOfDeceased}</span>
                <span className="text-[10px] font-black text-blue-400">
                  Published{" "}
                  {new Date(r.datePublished).toLocaleDateString("en-KE")}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Not in Gazette — records forwarded but not yet in gazette */}
      {notInGazette.length > 0 && (
        <details className="bg-red-50 border border-red-100 rounded-2xl p-6 cursor-pointer group">
          <summary className="flex items-center gap-3 font-black text-red-700 text-sm uppercase tracking-widest list-none">
            <AlertCircle size={16} className="shrink-0" />
            {notInGazette.length} Forwarded Records Not Yet in Gazette
            <ChevronRight
              size={14}
              className="ml-auto group-open:rotate-90 transition-transform"
            />
          </summary>
          <ul className="mt-4 space-y-1">
            {notInGazette.map((causeNo) => (
              <li key={causeNo}>
                <code className="bg-white text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                  {causeNo}
                </code>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 font-black text-xs uppercase tracking-widest transition-all hover:border-slate-300"
        >
          <RotateCcw size={14} />
          Upload New
        </button>

        <button
          disabled={selectedIds.length === 0 || confirmLoading}
          onClick={onConfirm}
          className="flex items-center gap-3 bg-[#004832] hover:bg-[#003526] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest text-sm px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[#004832]/20 disabled:shadow-none ml-auto"
        >
          {confirmLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send size={16} />
              Confirm & Publish {selectedIds.length} Record
              {selectedIds.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   STEP 2 — CONFIRMED
========================================================= */
const ConfirmedStep: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { confirmResult } = useSelector((state: RootState) => state.scanner);

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="w-24 h-24 bg-[#004832] rounded-full flex items-center justify-center shadow-2xl shadow-[#004832]/30">
        <ClipboardCheck size={40} className="text-white" />
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-black text-[#004832] uppercase tracking-tighter">
          Publication Confirmed
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          {confirmResult?.message}
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-12 py-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          Records Marked Published
        </p>
        <p className="text-5xl font-black text-[#004832]">
          {confirmResult?.modifiedCount ?? 0}
        </p>
      </div>

      <p className="text-slate-400 text-xs text-center max-w-md">
        Email notifications have been sent to all relevant court stations.
        Records are now marked as{" "}
        <span className="font-black text-[#004832]">Published</span> in the
        system.
      </p>

      <button
        onClick={onReset}
        className="flex items-center gap-3 bg-[#C8A239] hover:bg-[#b8922e] text-white font-black uppercase tracking-widest text-sm px-10 py-4 rounded-2xl transition-all shadow-lg shadow-[#C8A239]/20"
      >
        <RotateCcw size={16} />
        Scan Another Gazette
      </button>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */
const AdminScan: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { step, previewLoading, previewError, confirmLoading, confirmError } =
    useSelector((state: RootState) => state.scanner);
  const { selectedIds } = useSelector((state: RootState) => state.scanner);

  const handleFileSelect = async (file: File) => {
    const result = await dispatch(previewScan(file));
    if (previewScan.rejected.match(result)) {
      toast.error(result.payload ?? "Scan failed");
    }
  };

  const handleConfirm = async () => {
    if (selectedIds.length === 0) return;
    const result = await dispatch(confirmScan(selectedIds));
    if (confirmScan.fulfilled.match(result)) {
      toast.success(
        `${result.payload.modifiedCount} record(s) marked as published`
      );
    } else if (confirmScan.rejected.match(result)) {
      toast.error(result.payload ?? "Confirmation failed");
    }
  };

  const handleReset = () => {
    dispatch(resetScanner());
  };

  return (
    <div className="relative p-4 md:p-8 bg-[#F9F9F7] min-h-screen font-sans">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-[#004832] uppercase tracking-tighter">
            Gazette{" "}
            <span className="text-[#C8A239]">Scanner</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
            <span className="w-6 h-[2px] bg-[#C8A239]" />
            Upload a Kenya Gazette PDF to match and publish records
          </p>
        </div>

        {/* STEP INDICATOR */}
        <StepIndicator current={step} />

        {/* GLOBAL CONFIRM ERROR */}
        {confirmError && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-3 rounded-2xl text-sm font-bold">
            <XCircle size={16} className="shrink-0" />
            {confirmError}
          </div>
        )}

        {/* STEP CONTENT */}
        {step === 0 && (
          <UploadStep
            onFileSelect={handleFileSelect}
            loading={previewLoading}
            error={previewError}
          />
        )}

        {step === 1 && (
          <PreviewStep
            onConfirm={handleConfirm}
            onReset={handleReset}
            confirmLoading={confirmLoading}
          />
        )}

        {step === 2 && <ConfirmedStep onReset={handleReset} />}
      </div>
    </div>
  );
};

export default AdminScan;
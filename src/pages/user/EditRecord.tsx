import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import type {
  Record as IRecord,
  Form60Compliance,
  StatusAtGP,
} from "../../store/slices/recordsSlice";
import { updateRecord } from "../../store/slices/recordsSlice";
import { fetchCourts } from "../../store/slices/courtsSlice";
import { 
  Gavel, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  XCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface EditRecordProps {
  record: IRecord;
  onClose: () => void;
}

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

const EditRecord: React.FC<EditRecordProps> = ({ record, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { courts } = useSelector((state: RootState) => state.courts);

  const [formData, setFormData] = useState({
    causeNo: record.causeNo,
    nameOfDeceased: record.nameOfDeceased,
    dateReceived: record.dateReceived?.split("T")[0] || "",
    dateOfReceipt: record.dateOfReceipt?.split("T")[0] || "",
    dateForwardedToGP: record.dateForwardedToGP?.split("T")[0] || "",
    form60Compliance: record.form60Compliance as Form60Compliance,
    rejectionReason: record.rejectionReason || "",
    statusAtGP: record.statusAtGP as StatusAtGP,
    courtId: record.courtStation?._id || "",
  });

  useEffect(() => {
    if (courts.length === 0) dispatch(fetchCourts());
  }, [dispatch, courts.length]);

  useEffect(() => {
    if (formData.form60Compliance !== "Rejected") {
      setFormData((prev) => ({ ...prev, rejectionReason: "" }));
    }
  }, [formData.form60Compliance]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.form60Compliance === "Rejected" && !formData.rejectionReason) {
      return toast.error("⚠️ Please select a rejection reason.");
    }

    dispatch(
      updateRecord({
        id: record._id,
        data: {
          ...formData,
          dateReceived: formData.dateReceived || undefined,
          dateOfReceipt: formData.dateOfReceipt || undefined,
          dateForwardedToGP: formData.dateForwardedToGP || undefined,
          courtStation: formData.courtId || undefined,
        },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("✅ Record updated successfully.");
        onClose();
      })
      .catch((err: string) => toast.error(err));
  };

  const labelStyle = "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2";
  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#c2a336]/20 focus:border-[#c2a336] transition-all outline-none";

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: LEGAL CORE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 bg-[#1a3a32] rounded-lg">
                <Gavel size={14} className="text-[#c2a336]" />
            </div>
            <h3 className="text-xs font-black text-[#1a3a32] uppercase tracking-[0.2em]">
              Case Identifiers
            </h3>
          </div>

          <div className="grid gap-5">
            <div>
              <label className={labelStyle}><FileText size={12} /> Cause Number</label>
              <input
                type="text"
                name="causeNo"
                value={formData.causeNo}
                onChange={handleChange}
                placeholder="e.g. HC/123/2023"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}><User size={12} /> Name of Deceased</label>
              <input
                type="text"
                name="nameOfDeceased"
                value={formData.nameOfDeceased}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}><MapPin size={12} /> Court Station</label>
              <select
                name="courtId"
                value={formData.courtId}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Station...</option>
                {courts.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE & STATUS */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 bg-slate-100 rounded-lg">
                <Clock size={14} className="text-slate-500" />
            </div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
              Registry Processing
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}><Calendar size={12} /> Date Received</label>
              <input
                type="date"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}><Calendar size={12} /> Date of Receipt</label>
              <input
                type="date"
                name="dateOfReceipt"
                value={formData.dateOfReceipt}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}><Calendar size={12} /> Forwarded to GP</label>
            <input
              type="date"
              name="dateForwardedToGP"
              value={formData.dateForwardedToGP}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Compliance</label>
              <div className="relative">
                <select
                  name="form60Compliance"
                  value={formData.form60Compliance}
                  onChange={handleChange}
                  className={`${inputStyle} pr-10 ${
                    formData.form60Compliance === "Rejected"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                   {formData.form60Compliance === "Rejected" ? <XCircle size={16} className="text-rose-400" /> : <CheckCircle size={16} className="text-emerald-400" />}
                </div>
              </div>
            </div>
            <div>
              <label className={labelStyle}>GP Status</label>
              <select
                name="statusAtGP"
                value={formData.statusAtGP}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="Pending">Pending</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH REJECTION SECTION */}
      {formData.form60Compliance === "Rejected" && (
        <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-rose-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600">Rejection Protocol Required</h4>
          </div>
          <select
            name="rejectionReason"
            value={formData.rejectionReason}
            onChange={handleChange}
            className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm font-medium text-rose-900 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
          >
            <option value="">Select the primary reason for rejection...</option>
            {rejectionReasons.map((reason, idx) => (
              <option key={idx} value={reason}>{reason}</option>
            ))}
          </select>
          <p className="mt-3 text-[10px] text-rose-400 italic">This reason will be logged in the public ledger for station reference.</p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-all"
        >
          Cancel Changes
        </button>
        <button
          type="submit"
          className="flex items-center gap-3 bg-[#1a3a32] text-[#c2a336] text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-xl hover:bg-[#c2a336] hover:text-[#1a3a32] shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <FileText size={16} />
          Commit Update
        </button>
      </div>
    </form>
  );
};

export default EditRecord;
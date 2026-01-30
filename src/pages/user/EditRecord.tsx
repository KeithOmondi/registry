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
import toast from "react-hot-toast";

interface EditRecordProps {
  record: IRecord;
  onClose: () => void;
}

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
      return toast.error("⚠️ Please provide a rejection reason.");
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

  // Reusable Input Component for Styling Consistency
  const labelStyle =
    "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1 ml-1";
  const inputStyle =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#c2a336] focus:border-transparent transition-all outline-none bg-white";

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: CASE INFORMATION */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#1a3a32] border-b pb-2 uppercase tracking-widest">
            Case Information
          </h3>

          <div>
            <label className={labelStyle}>Cause Number</label>
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
            <label className={labelStyle}>Name of Deceased</label>
            <input
              type="text"
              name="nameOfDeceased"
              value={formData.nameOfDeceased}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Court Station</label>
            <select
              name="courtId"
              value={formData.courtId}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select Court</option>
              {courts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2: TIMELINES & COMPLIANCE */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#1a3a32] border-b pb-2 uppercase tracking-widest">
            Processing Details
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Date Received</label>
              <input
                type="date"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Date of Receipt</label>
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
            <label className={labelStyle}>Forwarded to GP</label>
            <input
              type="date"
              name="dateForwardedToGP"
              value={formData.dateForwardedToGP}
              onChange={handleChange}
              className={inputStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}>Compliance</label>
              <select
                name="form60Compliance"
                value={formData.form60Compliance}
                onChange={handleChange}
                className={`${inputStyle} ${formData.form60Compliance === "Rejected" ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}`}
              >
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
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

      {/* FULL WIDTH REJECTION REASON */}
      {formData.form60Compliance === "Rejected" && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className={`${labelStyle} text-red-600`}>
            Rejection Reason
          </label>
          <input
            type="text"
            name="rejectionReason"
            value={formData.rejectionReason}
            onChange={handleChange}
            placeholder="Explain why the record was rejected..."
            className={`${inputStyle} border-red-200 bg-red-50 focus:ring-red-500`}
          />
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
        >
          Discard
        </button>
        <button
          type="submit"
          className="bg-[#1a3a32] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-[#142d26] shadow-md active:scale-95 transition-all"
        >
          Save Update
        </button>
      </div>
    </form>
  );
};

export default EditRecord;

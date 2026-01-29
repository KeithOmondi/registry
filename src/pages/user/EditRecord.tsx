import React, { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import type { Record as IRecord, Form60Compliance, StatusAtGP } from "../../store/slices/recordsSlice";
import { updateRecord } from "../../store/slices/recordsSlice";
import toast from "react-hot-toast";

interface EditRecordProps {
  record: IRecord;
  onClose: () => void;
}

const EditRecord: React.FC<EditRecordProps> = ({ record, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  /* =========================================================
     Local Form State
  ========================================================= */
  const [formData, setFormData] = useState({
    causeNo: record.causeNo,
    nameOfDeceased: record.nameOfDeceased,
    dateReceived: record.dateReceived?.split("T")[0] || "",
    dateOfReceipt: record.dateOfReceipt?.split("T")[0] || "",
    dateForwardedToGP: record.dateForwardedToGP?.split("T")[0] || "",
    form60Compliance: record.form60Compliance as Form60Compliance,
    rejectionReason: record.rejectionReason || "",
    statusAtGP: record.statusAtGP as StatusAtGP,
  });

  /* =========================================================
     Handlers
  ========================================================= */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          // ✅ Keep as strings to match slice
          dateReceived: formData.dateReceived || undefined,
          dateOfReceipt: formData.dateOfReceipt || undefined,
          dateForwardedToGP: formData.dateForwardedToGP || undefined,
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("✅ Record updated successfully.");
        onClose();
      })
      .catch((err: string) => toast.error(err));
  };

  /* =========================================================
     Clear rejection reason if compliance changes
  ========================================================= */
  useEffect(() => {
    if (formData.form60Compliance !== "Rejected") {
      setFormData((prev) => ({ ...prev, rejectionReason: "" }));
    }
  }, [formData.form60Compliance]);

  /* =========================================================
     UI
  ========================================================= */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cause No */}
      <div>
        <label className="block font-medium text-sm mb-1">Cause No</label>
        <input
          type="text"
          name="causeNo"
          value={formData.causeNo}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Name of Deceased */}
      <div>
        <label className="block font-medium text-sm mb-1">Name of Deceased</label>
        <input
          type="text"
          name="nameOfDeceased"
          value={formData.nameOfDeceased}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Dates */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-sm mb-1">Date Received</label>
          <input
            type="date"
            name="dateReceived"
            value={formData.dateReceived}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium text-sm mb-1">Date of Receipt</label>
          <input
            type="date"
            name="dateOfReceipt"
            value={formData.dateOfReceipt}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-sm mb-1">Date Forwarded to GP</label>
          <input
            type="date"
            name="dateForwardedToGP"
            value={formData.dateForwardedToGP}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Form 60 Compliance & Rejection Reason */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-sm mb-1">Form 60 Compliance</label>
          <select
            name="form60Compliance"
            value={formData.form60Compliance}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            {["Approved", "Rejected"].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          {formData.form60Compliance === "Rejected" && (
            <>
              <label className="block font-medium text-sm mb-1">Rejection Reason</label>
              <input
                type="text"
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </>
          )}
        </div>
      </div>

      {/* Status at GP */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-sm mb-1">Status at GP</label>
          <select
            name="statusAtGP"
            value={formData.statusAtGP}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            {["Pending", "Published"].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#0a2342] text-white px-4 py-2 rounded hover:bg-[#0a2342]/90"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditRecord;

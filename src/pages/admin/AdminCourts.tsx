import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  clearCourtsError,
  CourtLevels,
  type Court,
  type CourtLevel,
} from "../../store/slices/courtsSlice";
import type { AppDispatch, RootState } from "../../store/store";

// ── form shape keeps secondaryEmails as a raw string ──
interface CourtFormData {
  name: string;
  level: CourtLevel;
  magistrate: string;
  phone: string;
  primaryEmail: string;
  secondaryEmailsRaw: string; // renamed to avoid shadowing Court['secondaryEmails']
  code: string;
  location: string;
}

const EMPTY_FORM: CourtFormData = {
  name: "",
  level: CourtLevels.HIGH_COURT,
  magistrate: "",
  phone: "",
  primaryEmail: "",
  secondaryEmailsRaw: "",
  code: "",
  location: "",
};

const AdminCourts = () => {
  // ✅ typed dispatch — required for thunks to resolve correctly
  const dispatch = useDispatch<AppDispatch>();
  const { courts, loading, error } = useSelector(
    (state: RootState) => state.courts
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState<CourtFormData>(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingCourt(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      level: court.level,
      magistrate: court.magistrate ?? "",
      phone: court.phone ?? "",
      primaryEmail: court.primaryEmail,
      secondaryEmailsRaw: court.secondaryEmails?.join(", ") ?? "",
      code: court.code ?? "",
      location: court.location ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const courtData = {
      name: formData.name,
      level: formData.level,
      magistrate: formData.magistrate || undefined,
      phone: formData.phone || undefined,
      primaryEmail: formData.primaryEmail,
      secondaryEmails: formData.secondaryEmailsRaw
        ? formData.secondaryEmailsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      code: formData.code || undefined,
      location: formData.location || undefined,
    };

    if (editingCourt) {
      const result = await dispatch(updateCourt({ id: editingCourt._id, data: courtData }));
      if (updateCourt.fulfilled.match(result)) {
        setIsModalOpen(false);
        resetForm();
      }
    } else {
      const result = await dispatch(createCourt(courtData));
      if (createCourt.fulfilled.match(result)) {
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this court?")) {
      await dispatch(deleteCourt(id));
    }
  };

  // ── derive separate flags so a mutation doesn't collapse the table ──
  const isSubmitting = loading && isModalOpen;
  const isTableLoading = loading && !isModalOpen;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Courts</h1>
        <button
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Court
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => dispatch(clearCourtsError())}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Table loading */}
      {isTableLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Level", "Code", "Primary Email", "Location", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No courts found. Click "Add New Court" to create one.
                  </td>
                </tr>
              ) : (
                courts.map((court) => (
                  <tr key={court._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{court.name}</div>
                      {court.magistrate && (
                        <div className="text-sm text-gray-500">Magistrate: {court.magistrate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {court.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {court.code || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {court.primaryEmail}
                      {court.secondaryEmails && court.secondaryEmails.length > 0 && (
                        <div className="text-xs text-gray-400">
                          +{court.secondaryEmails.length} more
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {court.location || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(court)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(court._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCourt ? "Edit Court" : "Add New Court"}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Court Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Court Level *
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.values(CourtLevels).map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. HC001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Primary Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Email *
                  </label>
                  <input
                    type="email"
                    name="primaryEmail"
                    value={formData.primaryEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Secondary Emails */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Emails
                  </label>
                  <input
                    type="text"
                    name="secondaryEmailsRaw"
                    value={formData.secondaryEmailsRaw}
                    onChange={handleInputChange}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                {/* Magistrate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Magistrate Name
                  </label>
                  <input
                    type="text"
                    name="magistrate"
                    value={formData.magistrate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : editingCourt ? "Update Court" : "Create Court"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourts;
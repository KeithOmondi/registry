import React, { useState, useEffect, useMemo } from "react";
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

interface CourtFormData {
  name: string;
  level: CourtLevel;
  magistrate: string;
  phone: string;
  primaryEmail: string;
  secondaryEmailsRaw: string;
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

// Level → badge color map
const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  "Supreme Court":        { bg: "bg-purple-100",  text: "text-purple-800" },
  "Court of Appeal":      { bg: "bg-indigo-100",  text: "text-indigo-800" },
  "High Court":           { bg: "bg-[#004832]/10", text: "text-[#004832]" },
  "Employment & Labour":  { bg: "bg-orange-100",  text: "text-orange-800" },
  "Environment & Land":   { bg: "bg-teal-100",    text: "text-teal-800" },
  "Law Courts":           { bg: "bg-blue-100",    text: "text-blue-800" },
  "Magistrates Court":    { bg: "bg-yellow-100",  text: "text-yellow-800" },
  "Kadhi Court":          { bg: "bg-rose-100",    text: "text-rose-800" },
};

const getLevelBadge = (level: string) =>
  LEVEL_COLORS[level] ?? { bg: "bg-gray-100", text: "text-gray-700" };

const AdminCourts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courts, loading, error } = useSelector(
    (state: RootState) => state.courts
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState<CourtFormData>(EMPTY_FORM);

  // Filters
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("All");

  useEffect(() => {
    dispatch(fetchCourts());
  }, [dispatch]);

  // Derived filtered list
  const filteredCourts = useMemo(() => {
    const q = search.toLowerCase();
    return courts.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.primaryEmail.toLowerCase().includes(q) ||
        (c.code ?? "").toLowerCase().includes(q) ||
        (c.location ?? "").toLowerCase().includes(q) ||
        (c.magistrate ?? "").toLowerCase().includes(q);
      const matchesLevel = filterLevel === "All" || c.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [courts, search, filterLevel]);

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
      if (updateCourt.fulfilled.match(result)) { setIsModalOpen(false); resetForm(); }
    } else {
      const result = await dispatch(createCourt(courtData));
      if (createCourt.fulfilled.match(result)) { setIsModalOpen(false); resetForm(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this court?")) {
      await dispatch(deleteCourt(id));
    }
  };

  const isSubmitting = loading && isModalOpen;
  const isTableLoading = loading && !isModalOpen;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#004832] font-serif uppercase tracking-wide">
            Court Stations
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {courts.length} station{courts.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 bg-[#004832] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#003a28] transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span> Add Court Station
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl flex justify-between items-start">
          <span className="text-sm">{error}</span>
          <button onClick={() => dispatch(clearCourtsError())} className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, code, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all"
          />
        </div>

        {/* Level filter */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all bg-white min-w-[180px]"
        >
          <option value="All">All Levels</option>
          {Object.values(CourtLevels).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        {/* Clear filters */}
        {(search || filterLevel !== "All") && (
          <button
            onClick={() => { setSearch(""); setFilterLevel("All"); }}
            className="text-sm text-[#004832] font-medium hover:underline whitespace-nowrap px-1"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      {isTableLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#004832]" />
          <p className="mt-3 text-gray-500 text-sm">Loading court stations…</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-[#004832]/5">
                {["Court Name", "Level", "Code", "Primary Email", "Location", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#004832] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCourts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    {search || filterLevel !== "All"
                      ? "No courts match your search criteria."
                      : 'No courts found. Click "Add Court Station" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredCourts.map((court) => {
                  const badge = getLevelBadge(court.level);
                  return (
                    <tr key={court._id} className="hover:bg-[#004832]/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-gray-800">{court.name}</div>
                        {court.magistrate && (
                          <div className="text-xs text-gray-400 mt-0.5">{court.magistrate}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                          {court.level}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {court.code || "—"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                        {court.primaryEmail}
                        {court.secondaryEmails && court.secondaryEmails.length > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            +{court.secondaryEmails.length} more
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                        {court.location || "—"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditClick(court)}
                          className="inline-flex items-center gap-1 text-[#004832] hover:text-[#003a28] font-medium mr-4 transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(court._id)}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Result count footer */}
          {filteredCourts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredCourts.length} of {courts.length} court station{courts.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-16 px-4 pb-8">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#004832] font-serif uppercase tracking-wide">
                  {editingCourt ? "Edit Court Station" : "Add Court Station"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingCourt ? `Editing: ${editingCourt.name}` : "Fill in the details below"}
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Court Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Court Level <span className="text-red-400">*</span>
                  </label>
                  <select name="level" value={formData.level} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all bg-white">
                    {Object.values(CourtLevels).map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Court Code</label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. HC001"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="City, Address"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                </div>

                {/* Magistrate */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Presiding Officer</label>
                  <input type="text" name="magistrate" value={formData.magistrate} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                </div>

                {/* Primary Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Primary Email <span className="text-red-400">*</span>
                  </label>
                  <input type="email" name="primaryEmail" value={formData.primaryEmail} onChange={handleInputChange} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                </div>

                {/* Secondary Emails */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Secondary Emails</label>
                  <input type="text" name="secondaryEmailsRaw" value={formData.secondaryEmailsRaw} onChange={handleInputChange}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all" />
                  <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#004832] text-white rounded-xl text-sm font-semibold hover:bg-[#003a28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Saving…" : editingCourt ? "Update Station" : "Create Station"}
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
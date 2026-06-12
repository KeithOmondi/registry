import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  fetchAllUsers,
  toggleUserStatus,
  createUser,
  updateUser,
  deleteUser,
  clearUserError,
  type User,
} from "../../store/slices/userSlice";

/* ── Types ─────────────────────────────────────────── */
type RoleFilter = "All" | User["role"];
type StatusFilter = "All" | "Active" | "Suspended";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  pjNumber: string;
  password: string;
  role: User["role"];
}

const EMPTY_FORM: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  pjNumber: "",
  password: "",
  role: "user",
};

/* ── Role badge colours ────────────────────────────── */
const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  gp:    "bg-blue-50   text-blue-700   border-blue-200",
  user:  "bg-slate-50  text-slate-600  border-slate-200",
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export const AdminUsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector((state: RootState) => state.user);

  /* ── filters ── */
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState<RoleFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  /* ── modal state ── */
  type ModalMode = "create" | "edit" | "delete" | null;
  const [modalMode, setModalMode]       = useState<ModalMode>(null);
  const [targetUser, setTargetUser]     = useState<User | null>(null);
  const [formData, setFormData]         = useState<UserFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  /* ── derived list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.pjNumber ?? "").toLowerCase().includes(q);
      const matchRole   = roleFilter   === "All" || u.role   === roleFilter;
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" ? u.isActive : !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const hasFilters = search || roleFilter !== "All" || statusFilter !== "All";

  /* ── handlers ── */
  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setTargetUser(null);
    setModalMode("create");
  };

  const openEdit = (u: User) => {
    setTargetUser(u);
    setFormData({
      firstName: u.firstName,
      lastName:  u.lastName,
      email:     u.email,
      pjNumber:  u.pjNumber ?? "",
      password:  "",
      role:      u.role,
    });
    setModalMode("edit");
  };

  const openDelete = (u: User) => {
    setTargetUser(u);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setTargetUser(null);
    setFormData(EMPTY_FORM);
    dispatch(clearUserError());
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === "create") {
        const result = await dispatch(
          createUser({
            firstName: formData.firstName,
            lastName:  formData.lastName,
            email:     formData.email,
            pjNumber:  formData.pjNumber || undefined,
            password:  formData.password,
            role:      formData.role,
          })
        );
        if (createUser.fulfilled.match(result)) closeModal();
      } else if (modalMode === "edit" && targetUser) {
        const result = await dispatch(
          updateUser({
            id:   targetUser._id,
            data: {
              firstName: formData.firstName,
              lastName:  formData.lastName,
              email:     formData.email,
            },
          })
        );
        if (updateUser.fulfilled.match(result)) closeModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!targetUser) return;
    setIsSubmitting(true);
    const result = await dispatch(deleteUser(targetUser._id));
    setIsSubmitting(false);
    if (deleteUser.fulfilled.match(result)) closeModal();
  };

  const handleToggle = (userId: string) => dispatch(toggleUserStatus(userId));

  /* ── loading skeleton ── */
  if (loading && users.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6]">
        <div className="animate-pulse text-sm font-black text-[#1a3a32] uppercase tracking-[0.2em]">
          Loading Registry Personnel…
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
  return (
    <div className="p-4 md:p-8 bg-[#f4f7f6] min-h-screen">
      <div className="max-w-[1400px] mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#1a3a32] tracking-tight uppercase">
              User Management
            </h2>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em] mt-1">
              {users.length} officer{users.length !== 1 ? "s" : ""} in registry
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#b48222] hover:bg-[#966d1c] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
          >
            + Add New Officer
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => dispatch(clearUserError())} className="text-red-400 hover:text-red-700 text-lg leading-none">×</button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or PJ number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] transition-all"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] bg-white min-w-[130px]"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="gp">GP</option>
            <option value="user">User</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] bg-white min-w-[140px]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Authorized</option>
            <option value="Suspended">Suspended</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("All"); setStatusFilter("All"); }}
              className="text-xs text-[#1a3a32] font-bold uppercase tracking-widest hover:underline whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a3a32] text-white">
                  {["Full Name", "PJ Number", "Contact Email", "System Role", "Access Status", "Operations"].map((h) => (
                    <th key={h} className="p-5 text-[10px] font-black uppercase tracking-widest opacity-60 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      {hasFilters ? "No officers match your search criteria." : "Registry Database is Empty"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Name */}
                      <td className="p-5">
                        <span className="block text-sm font-black text-[#1a3a32] uppercase">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          ID: {u._id.slice(-8)}
                        </span>
                      </td>
                      {/* PJ Number */}
                      <td className="p-5 font-mono text-xs text-slate-500">
                        {u.pjNumber || "—"}
                      </td>
                      {/* Email */}
                      <td className="p-5 font-medium text-xs text-slate-600">
                        {u.email || "N/A"}
                      </td>
                      {/* Role */}
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-md text-[10px] font-mono font-black border ${ROLE_STYLES[u.role] ?? ROLE_STYLES.user}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="p-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.isActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}`}>
                          {u.isActive ? "● Authorized" : "○ Suspended"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => openEdit(u)}
                            className="text-[10px] font-black text-slate-400 hover:text-[#1a3a32] uppercase tracking-widest transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggle(u._id)}
                            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${u.isActive ? "text-orange-500 hover:text-orange-700" : "text-emerald-500 hover:text-emerald-700"}`}
                          >
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => openDelete(u)}
                            className="text-[10px] font-black text-red-400 hover:text-red-700 uppercase tracking-widest"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {filtered.length} of {users.length} officers
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════════ */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4 pb-8 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-[#1a3a32] uppercase tracking-widest">
                  {modalMode === "create" ? "Add New Officer" : "Edit Officer"}
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                  {modalMode === "edit" ? `Editing: ${targetUser?.firstName} ${targetUser?.lastName}` : "Fill in officer details below"}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" name="firstName" value={formData.firstName}
                    onChange={handleInput} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] transition-all"
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text" name="lastName" value={formData.lastName}
                    onChange={handleInput} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleInput} required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* PJ Number */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    PJ / Personnel No.
                  </label>
                  <input
                    type="text" name="pjNumber" value={formData.pjNumber}
                    onChange={handleInput} placeholder="e.g. PJ1001"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] transition-all"
                  />
                </div>
                {/* Role */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    System Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="role" value={formData.role} onChange={handleInput}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] bg-white transition-all"
                  >
                    <option value="user">User</option>
                    <option value="gp">GP</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Password — create only */}
              {modalMode === "create" && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password" name="password" value={formData.password}
                    onChange={handleInput} required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20 focus:border-[#1a3a32] transition-all"
                  />
                </div>
              )}

              {/* Error inside modal */}
              {error && (
                <p className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-3 py-2 rounded-lg">
                  ⚠️ {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button" onClick={closeModal}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#1a3a32] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0f2820] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Saving…" : modalMode === "create" ? "Create Officer" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════ */}
      {modalMode === "delete" && targetUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-[#1a3a32] uppercase tracking-widest mb-1">
                Remove Officer
              </h3>
              <p className="text-xs text-slate-500">
                Permanently remove{" "}
                <span className="font-black text-[#1a3a32] uppercase">
                  {targetUser.firstName} {targetUser.lastName}
                </span>{" "}
                from the registry? This action cannot be undone.
              </p>
            </div>

            {error && (
              <p className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-3 py-2 rounded-lg mb-4 text-center">
                ⚠️ {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Removing…" : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
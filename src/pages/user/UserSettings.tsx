import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { changePassword, clearAuthError } from "../../store/slices/authSlice";
import { updateMyProfile, fetchMyProfile } from "../../store/slices/userSlice";

// Error type for API responses
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const UserSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: authUser, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
  const { currentUser, loading: userLoading, error: userError } = useSelector((state: RootState) => state.user);
  
  // Use currentUser from userSlice if available, otherwise fallback to authUser
  const user = currentUser || authUser;
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (!currentUser && authUser) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, currentUser, authUser]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const getErrorMessage = (err: unknown): string => {
    const apiError = err as ApiError;
    return apiError.response?.data?.message || apiError.message || "Operation failed";
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      toast.error("All profile fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateMyProfile(profileForm)).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm
      })).unwrap();
      
      toast.success("Password changed successfully!");
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; textColor: string; width: string } => {
    if (!password) return { strength: "", color: "", textColor: "", width: "0%" };
    
    if (password.length >= 12) {
      return { strength: "Strong Security", color: "bg-emerald-600", textColor: "text-emerald-600", width: "100%" };
    } else if (password.length >= 8) {
      return { strength: "Moderate Security", color: "bg-amber-500", textColor: "text-amber-600", width: "66%" };
    } else {
      return { strength: "Weak Password", color: "bg-rose-500", textColor: "text-rose-600", width: "33%" };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const isLoading = authLoading || userLoading || isSubmitting;
  const error = authError || userError;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 antialiased text-gray-800">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h2 className="text-2xl font-bold text-[#004832] font-serif">User Settings</h2>
          <p className="text-sm text-gray-500 mt-1 font-serif">Manage your account profile details and authentication credentials.</p>
        </div>
        
        {/* User Info Section */}
        <div className="mb-8 bg-gray-50/70 rounded-xl border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2 font-serif">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs font-semibold text-[#004832] bg-[#004832]/5 hover:bg-[#004832]/10 px-3 py-1.5 rounded-md transition-colors"
            >
              {isEditingProfile ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          
          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-gray-600 mb-1.5">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all disabled:bg-gray-100"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-600 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all disabled:bg-gray-100"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all disabled:bg-gray-100"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#004832] text-white py-2 text-sm rounded-lg font-medium hover:bg-[#003a28] shadow-sm shadow-[#004832]/10 transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      email: user?.email || "",
                    });
                  }}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-gray-200/60 text-sm">
              <div className="flex justify-between items-center py-2.5">
                <span className="font-medium text-gray-500">Full Name</span>
                <span className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="font-medium text-gray-500">Email Address</span>
                <span className="text-gray-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="font-medium text-gray-500">PJ / Personnel Number</span>
                <span className="text-gray-900 font-mono text-xs bg-gray-200/60 px-2 py-0.5 rounded">
                  {user?.pjNumber || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="font-medium text-gray-500">System Role</span>
                <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#004832]/10 text-[#004832]">
                  {user?.role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div>
          <h3 className="text-md font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Update Password
          </h3>
          
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-lg flex gap-2.5 items-start">
              <svg className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-rose-700 text-xs font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all disabled:bg-gray-100"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all disabled:bg-gray-100"
                disabled={isLoading}
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Password requirement: 8 or more characters
              </p>
            </div>

            <div>
              <label htmlFor="newPasswordConfirm" className="block text-xs font-medium text-gray-600 mb-1.5">
                Confirm New Password
              </label>
              <input
                id="newPasswordConfirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all disabled:bg-gray-100"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password strength indicator */}
            {newPassword && newPassword.length > 0 && (
              <div className="mt-1 bg-gray-50 border border-gray-100 p-2.5 rounded-lg transition-all">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-medium text-gray-500">Password Strength:</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${passwordStrength.textColor}`}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-200/80 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-[2] bg-[#004832] text-white py-2 text-sm rounded-lg font-semibold hover:bg-[#003a28] shadow-sm shadow-[#004832]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setNewPasswordConfirm("");
                  dispatch(clearAuthError());
                }}
                className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-8 p-4.5 bg-slate-50 border border-slate-200/60 rounded-xl flex gap-3.5">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0 self-start">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">Security Standards</h4>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside leading-relaxed">
              <li>Deploy complex passwords featuring alternating uppercase/lowercase variations.</li>
              <li>Integrate numbers and contextual special characters (<code className="bg-slate-200 px-1 py-0.5 font-mono rounded text-slate-700">@#$!</code>).</li>
              <li>Do not reuse or recycle passwords configured for other networks or platforms.</li>
              <li>Immediately cycle credentials if you suspect unauthorized account access.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { login, clearAuthError } from "../../store/slices/authSlice";

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // 1. We now track 'isAuthenticated' instead of 'tokens'
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const [pjNumber, setPjNumber] = useState("");
  const [password, setPassword] = useState("");
  const hasRedirected = useRef(false);

  // Redirect if already authenticated
  useEffect(() => {
    // If isAuthenticated is true, the browser has valid HttpOnly cookies
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.success(`Welcome back, ${user.firstName}`);

      const targetPath = user.role === "admin" ? "/admin" : "/dashboard";
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle Backend Errors
  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Login failed");
      // Optional: Clear error after showing it so it doesn't pop up again on re-render
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pjNumber || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // The login thunk now sets HttpOnly cookies via the backend
      await dispatch(login({ pjNumber, password })).unwrap();
    } catch (err: any) {
      // Errors are caught by the useEffect observing the 'error' state
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
        {/* JUDICIARY WATERMARK */}
        <img
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
          alt="Judiciary Watermark"
          className="pointer-events-none absolute inset-0 m-auto w-[70%] max-w-xl opacity-[0.04] grayscale select-none"
        />

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden relative z-10">
          {/* LEFT COLUMN — BRANDING */}
          <div className="hidden md:flex flex-col items-center justify-center bg-[#1a3a32] text-white p-10 relative">
            <div className="text-center space-y-6 z-10">
              <h2 className="text-2xl font-bold tracking-wide uppercase">
                Office of the Registrar <br />
                <span className="text-[#c2a336]">High Court</span>
              </h2>
              <div className="h-1 w-20 bg-[#c2a336] mx-auto rounded-full"></div>
              <p className="text-emerald-100/70 text-sm max-w-md mx-auto leading-relaxed">
                Urithi Portal
              </p>
            </div>

            <img
              src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
              alt="Judiciary Logo"
              className="w-1/2 mt-12 opacity-90 drop-shadow-2xl"
            />

            <div className="absolute bottom-6 text-[10px] text-emerald-100/40 tracking-widest uppercase">
              © {new Date().getFullYear()} Judiciary of Kenya
            </div>
          </div>

          {/* RIGHT COLUMN — LOGIN FORM */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
              <p className="text-gray-500 text-sm">
                Access the High Court Management Portal using your PJ
                credentials.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">
                  PJ Number
                </label>
                <input
                  type="text"
                  value={pjNumber}
                  onChange={(e) => setPjNumber(e.target.value)}
                  placeholder="Enter PJ Number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#c2a336] focus:border-transparent focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#c2a336] focus:border-transparent focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-gray-300 text-[#1a3a32] focus:ring-[#c2a336]"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-[#c2a336] font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a32] text-white py-4 rounded-xl font-bold hover:bg-[#142d26] transform active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Login to Portal"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs">
                Authorized Access Only. All activities are monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
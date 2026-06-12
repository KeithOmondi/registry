import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { login } from "../../store/slices/authSlice";

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Local States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ======================
      REDIRECT LOGIC
  ====================== */
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "gp") {
        navigate("/gp", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  /* ======================
      HANDLERS
  ====================== */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValue = email.trim();
    const passwordValue = password.trim();

    if (!emailValue) {
      toast.error("Email is required");
      return;
    }

    if (!passwordValue) {
      toast.error("Password is required");
      return;
    }

    setIsLoggingIn(true);
    try {
      const userData = await dispatch(
        login({ email: emailValue, password: passwordValue })
      ).unwrap();
      toast.success(`Welcome back, ${userData.firstName}`);
    } catch (err) {
      toast.error(String(err));
      setIsLoggingIn(false);
    }
  };

  /* ======================
      RENDER
  ====================== */
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">⚖️</div>
            <h1 className="text-2xl font-bold text-[#004832] uppercase font-serif">
              Sign In | Uridhi Portal
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-serif">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all"
                autoComplete="email"
                disabled={isLoggingIn}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#004832]/20 focus:border-[#004832] transition-all"
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoggingIn}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-[#004832] transition-colors disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-3.832M6.343 6.343A9.956 9.956 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-2.168 3.832M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#004832] text-white py-3 rounded-xl font-semibold disabled:opacity-70 transition-all hover:bg-[#003a28]"
            >
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-serif font-extrabold">
              OFFICE OF THE REGISTRAR
              <br />
              HIGH COURT OF KENYA
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
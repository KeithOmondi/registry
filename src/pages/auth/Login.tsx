import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { login, verifyOtp } from "../../store/slices/authSlice";

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  const {
    user,
    isAuthenticated,
    status,
    otpSent,
    pjNumber,
  } = useSelector((state: RootState) => state.auth);

  const [localPJ, setLocalPJ] = useState(pjNumber);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const loading = status === "loading";

  /* ======================
     REDIRECT
  ====================== */
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  /* ======================
     OTP TIMER
  ====================== */
  useEffect(() => {
    if (!resendTimer) return;
    const id = setInterval(() => {
      setResendTimer((t) => Math.max(t - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  /* ======================
     HANDLERS
  ====================== */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = localPJ.trim();

    if (!value) {
      toast.error("PJ number is required");
      return;
    }

    try {
      await dispatch(login({ pjNumber: value })).unwrap();
      toast.success("OTP sent");
      setOtp("");
      setResendTimer(60);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = otp.trim();

    if (!value) {
      toast.error("OTP is required");
      return;
    }

    try {
      const user = await dispatch(
        verifyOtp({ pjNumber, otp: value }),
      ).unwrap();
      toast.success(`Welcome back, ${user.firstName}`);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleResendOtp = async () => {
    if (!pjNumber || loading || resendTimer) return;
    try {
      await dispatch(login({ pjNumber })).unwrap();
      toast.success("OTP resent");
      setResendTimer(60);
    } catch (err) {
      toast.error(String(err));
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
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-sm text-gray-500 mb-8">
            Access using your PJ number
          </p>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <input
                value={localPJ}
                onChange={(e) => setLocalPJ(e.target.value)}
                placeholder="PJ Number"
                className="w-full border rounded-xl px-4 py-3"
                autoComplete="username"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a32] text-white py-3 rounded-xl font-semibold disabled:opacity-70"
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full border rounded-xl px-4 py-3 tracking-widest"
                inputMode="numeric"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a32] text-white py-3 rounded-xl font-semibold disabled:opacity-70"
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendTimer > 0}
                className="w-full text-sm text-gray-600"
              >
                {resendTimer
                  ? `Resend OTP in ${resendTimer}s`
                  : "Resend OTP"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

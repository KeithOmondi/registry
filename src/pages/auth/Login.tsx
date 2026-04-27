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
    otpSent,
    pjNumber,
  } = useSelector((state: RootState) => state.auth);

  // Local States
  const [localPJ, setLocalPJ] = useState(pjNumber);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  
  // Specific loading states to prevent "Global Loading" layout shifts
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  /* ======================
      REDIRECT LOGIC
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

    setIsSendingOtp(true);
    try {
      await dispatch(login({ pjNumber: value })).unwrap();
      toast.success("OTP sent");
      setOtp("");
      setResendTimer(60);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = otp.trim();

    if (!value) {
      toast.error("OTP is required");
      return;
    }

    setIsVerifying(true);
    try {
      const userData = await dispatch(
        verifyOtp({ pjNumber, otp: value }),
      ).unwrap();
      toast.success(`Welcome back, ${userData.firstName}`);
      // Note: We don't set isVerifying to false here on success 
      // to keep the loading state active until the redirect completes.
    } catch (err) {
      toast.error(String(err));
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pjNumber || isSendingOtp || resendTimer) return;
    
    setIsSendingOtp(true);
    try {
      await dispatch(login({ pjNumber })).unwrap();
      toast.success("OTP resent");
      setResendTimer(60);
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsSendingOtp(false);
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
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20"
                autoComplete="username"
                disabled={isSendingOtp}
              />
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full bg-[#1a3a32] text-white py-3 rounded-xl font-semibold disabled:opacity-70 transition-all"
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full border rounded-xl px-4 py-3 tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1a3a32]/20"
                inputMode="numeric"
                disabled={isVerifying}
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-[#1a3a32] text-white py-3 rounded-xl font-semibold disabled:opacity-70 transition-all"
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isVerifying || isSendingOtp || resendTimer > 0}
                className="w-full text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
              >
                {isSendingOtp 
                  ? "Resending..." 
                  : resendTimer 
                    ? `Resend OTP in ${resendTimer}s` 
                    : "Resend OTP"
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
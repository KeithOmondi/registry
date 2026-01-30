import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { login, verifyOtp } from "../../store/slices/authSlice";

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    loading,
    otpSent,
    pjNumber: storedPJ,
  } = useSelector((state: RootState) => state.auth);

  const [pjNumber, setPjNumber] = useState(storedPJ || "");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const hasRedirected = useRef(false);

  // Redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      const targetPath = user.role === "admin" ? "/admin" : "/dashboard";
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // OTP resend countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPJ = pjNumber.trim();
    if (!trimmedPJ) {
      toast.error("Please enter your PJ number");
      return;
    }

    try {
      await dispatch(login({ pjNumber: trimmedPJ, password: "" })).unwrap();
      toast.success("OTP sent to your registered email");
      setResendTimer(60);
      setOtp("");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to send OTP");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      const userData = await dispatch(
        verifyOtp({ pjNumber: storedPJ || pjNumber, otp: trimmedOtp }),
      ).unwrap();
      toast.success(`Welcome back, ${userData.firstName}`);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "OTP verification failed");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const trimmedPJ = storedPJ || pjNumber;
    if (!trimmedPJ) return;

    try {
      await dispatch(login({ pjNumber: trimmedPJ, password: "" })).unwrap();
      toast.success("OTP resent to your registered email");
      setResendTimer(60);
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to resend OTP");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
        <img
          src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png"
          alt="Judiciary Watermark"
          className="pointer-events-none absolute inset-0 m-auto w-[70%] max-w-xl opacity-[0.04] grayscale select-none"
        />

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden relative z-10">
          {/* Branding side */}
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
              className="w-1/2 mt-12 opacity-90 drop-shadow-2xl"
              alt="Logo"
            />
            <div className="absolute bottom-6 text-[10px] text-emerald-100/40 tracking-widest uppercase">
              © {new Date().getFullYear()} Judiciary of Kenya
            </div>
          </div>

          {/* Form side */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
              <p className="text-gray-500 text-sm">
                Access using your PJ number.
              </p>
            </div>

            {!otpSent ? (
              // Step 1: PJ Number
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">
                    PJ Number
                  </label>
                  <input
                    type="text"
                    value={pjNumber}
                    onChange={(e) => setPjNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#c2a336] focus:outline-none bg-gray-50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a32] text-white py-4 rounded-xl font-bold hover:bg-[#142d26] transition-all disabled:opacity-70"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              // Step 2: OTP input
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#c2a336] focus:outline-none bg-gray-50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a32] text-white py-4 rounded-xl font-bold hover:bg-[#142d26] transition-all disabled:opacity-70"
                >
                  {loading ? "Verifying OTP..." : "Verify OTP"}
                </button>

                {/* Resend OTP */}
                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleResendOtp}
                  className="mt-2 w-full bg-gray-300 text-gray-800 py-2 rounded-xl font-bold hover:bg-gray-400 transition-all disabled:opacity-50"
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

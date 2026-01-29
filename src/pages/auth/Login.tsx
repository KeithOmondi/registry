import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { login } from "../../store/slices/authSlice";

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const [pjNumber, setPjNumber] = useState("");
  const [password, setPassword] = useState("");
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true;
      const targetPath = user.role === "admin" ? "/admin" : "/dashboard";
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pjNumber || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Step 1: Just unwrap the thunk. 
      // The slice handles clearing old errors automatically.
      const result = await dispatch(login({ pjNumber, password })).unwrap();
      toast.success(`Welcome back, ${result.firstName}`);
    } catch (err: any) {
      // Step 2: Handle the rejection message directly.
      // 'err' here is the string we returned from rejectWithValue.
      toast.error(typeof err === "string" ? err : "Unauthorized access");
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
          {/* BRANDING SIDE */}
          <div className="hidden md:flex flex-col items-center justify-center bg-[#1a3a32] text-white p-10 relative">
            <div className="text-center space-y-6 z-10">
              <h2 className="text-2xl font-bold tracking-wide uppercase">
                Office of the Registrar <br />
                <span className="text-[#c2a336]">High Court</span>
              </h2>
              <div className="h-1 w-20 bg-[#c2a336] mx-auto rounded-full"></div>
              <p className="text-emerald-100/70 text-sm max-w-md mx-auto leading-relaxed">Urithi Portal</p>
            </div>
            <img src="https://judiciary.go.ke/wp-content/uploads/2023/05/logo1-Copy-2.png" className="w-1/2 mt-12 opacity-90 drop-shadow-2xl" alt="Logo" />
            <div className="absolute bottom-6 text-[10px] text-emerald-100/40 tracking-widest uppercase">
              © {new Date().getFullYear()} Judiciary of Kenya
            </div>
          </div>

          {/* FORM SIDE */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-white">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h1>
              <p className="text-gray-500 text-sm">Access using your PJ credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">PJ Number</label>
                <input
                  type="text"
                  value={pjNumber}
                  onChange={(e) => setPjNumber(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#c2a336] focus:outline-none bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#c2a336] focus:outline-none bg-gray-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a32] text-white py-4 rounded-xl font-bold hover:bg-[#142d26] transition-all disabled:opacity-70"
              >
                {loading ? "Authenticating..." : "Login to Portal"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
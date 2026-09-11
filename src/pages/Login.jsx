import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchExams } from "../services/backendService.js";

export default function Login() {
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    let res;

    try {
      res = await loginStudent(id, password, loginMethod);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed. Please try again.");
      return;
    }

    if (res.success) {
      {
        // After successful student login, attempt to fetch available exams and redirect to start exam if possible.
        try {
          const exams = await fetchExams();
          // prefer an active exam; otherwise take first
          const now = Date.now();
          let chosen = exams.find((e) => e && e.active) || exams[0];

          // If the user's payment status is not paid, redirect to profile/registration
          const student = res.user ?? null;
          console.log("Login - Student data:", { student, paymentStatus: student?.paymentStatus, amount: student?.amount, paymentId: student?.paymentId });
          
          // Check if payment is completed
          const paymentStatus = String(student?.paymentStatus || "").toLowerCase();
          const isPaid = paymentStatus === 'paid' || 
                        paymentStatus === 'success' || 
                        paymentStatus === 'completed' ||
                        (Number(student?.amount || 0) > 0 && student?.paymentId);
          
          console.log("Login - Payment check:", { paymentStatus, isPaid, amount: student?.amount, paymentId: student?.paymentId });

          if (chosen && isPaid) {
            console.log("Login - Redirecting to exam");
            navigate(`/exam/${chosen.id}/start`, { state: { exam: chosen } });
          } else {
            // Not paid or no exam available — go to profile
            console.log("Login - Redirecting to profile (payment not completed or no exam)");
            navigate('/student/profile');
          }
        } catch (err) {
          // fallback navigation
          console.warn('Failed to fetch exams after login', err);
          navigate('/student/profile');
        }
      }
    } else {
      setError(res.message || "Invalid credentials.");
    }
  }

  return (
    <div>

      <section className="relative flex min-h-[calc(100svh-7rem)] items-center overflow-hidden bg-[radial-gradient(circle_at_top_right,#fff0df_0%,transparent_38%),linear-gradient(135deg,#fffaf5_0%,#f5f8fb_100%)] px-4 py-8 sm:px-6 md:py-12">
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#ed5a00]/10 blur-3xl" />
        <div className="container-app relative flex justify-center">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[460px] rounded-[28px] border border-[#f0e4d7] bg-white p-5 shadow-[0_20px_55px_rgba(23,59,95,0.14)] sm:p-7 md:p-8"
          >

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0df] text-[#ed5a00]"><GraduationCap size={25} /></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ed5a00]">Student portal</p>
              <h1 className="mt-2 text-2xl font-black text-[#173b5f] sm:text-3xl">Welcome back</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to access your exams, results and profile.</p>
            </div>

            <div className="mb-4">
                <div className="flex rounded-2xl bg-[#fff4e8] p-1">
                  {[
                    ["mobile", "Mobile Number"],
                    ["email", "Email"],
                  ].map(([method, label]) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setLoginMethod(method);
                        setId("");
                        setError("");
                      }}
                      className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-all duration-300 ${
                        loginMethod === method
                          ? "bg-navy text-white shadow-md"
                          : "text-gray-700 hover:text-navy"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Student accounts support either registered email or mobile number. */}

            <div className="mb-4">

              <label className="mb-1.5 block text-sm font-bold text-[#173b5f]">
                {loginMethod === "mobile" ? "Mobile Number" : "Email Address"}
              </label>

              <input
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={
                  loginMethod === "mobile"
                    ? "e.g. 9876543210"
                    : "e.g. student@gmail.com"
                }
                type={loginMethod === "email" ? "email" : "tel"}
                inputMode={loginMethod === "mobile" ? "numeric" : undefined}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#ed5a00] focus:ring-4 focus:ring-[#ed5a00]/10"
              />

            </div>

            {/* Password */}

            <div className="mb-5">

              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#173b5f]">
                <LockKeyhole size={15} /> Password
              </label>

              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition-all duration-300 focus:border-[#ed5a00] focus:ring-4 focus:ring-[#ed5a00]/10"
              />
            </div>
                        {/* Login Button */}

            <button
              type="submit"
              className="
                w-full
                bg-[#ed5a00]
                hover:bg-[#c94c00]
                text-white
                text-[15px]
                font-semibold
                py-3.5
                rounded-xl
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-xl
              "
            >
              Login as Student
            </button>

            {/* Register */}

            <p className="mt-4 text-center text-[13px] text-gray-600">
                New student?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#8B1E3F] hover:text-[#F07A24] transition-colors duration-300"
                >
                  Register here
                </Link>
            </p>

            <p className="mt-3 text-center text-[13px]">
                <Link to="/forgot-password" className="font-semibold text-[#e85d04] hover:text-[#8B1E3F] transition-colors duration-300">
                  Forgot password?
                </Link>
            </p>

            

          </form>

        </div>
      </section>
    </div>
  );
}
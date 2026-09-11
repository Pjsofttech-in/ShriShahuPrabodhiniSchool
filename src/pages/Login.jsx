import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
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
      try {
        const exams = await fetchExams();
        const chosen = exams.find((exam) => exam && exam.active) || exams[0];
        const student = res.user ?? null;
        const paymentStatus = String(student?.paymentStatus || "").toLowerCase();
        const isPaid = ["paid", "success", "completed"].includes(paymentStatus) || (Number(student?.amount || 0) > 0 && student?.paymentId);
        if (chosen && isPaid) navigate(`/exam/${chosen.id}/start`, { state: { exam: chosen } });
        else navigate("/student/profile");
      } catch (err) {
        console.warn("Failed to fetch exams after login", err);
        navigate("/student/profile");
      }
    } else {
      setError(res.message || "Invalid credentials.");
    }
  }

  return (
    <div className="login-page">
      <section className="login-stage relative flex h-[calc(100svh-4rem)] items-start overflow-hidden bg-[#fff8ef] px-4 py-3 sm:px-6 md:h-[calc(100svh-5.75rem)] md:py-4 xl:h-[calc(100svh-6.75rem)]">
        <div className="pointer-events-none absolute -left-28 -top-32 h-80 w-80 rounded-full bg-[#ed5a00]/15" />
        <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#173b5f]/10" />
        <div className="container-app relative flex h-full items-start justify-center px-0 pt-2 pb-4 sm:pt-3 sm:pb-5">
          <div className="login-card grid w-full max-w-[760px] overflow-hidden rounded-[22px] border border-[#f0dfcf] bg-white shadow-[0_18px_48px_rgba(23,59,95,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="login-visual relative hidden overflow-hidden bg-[linear-gradient(145deg,#173b5f_0%,#255c7c_62%,#ed5a00_155%)] p-5 text-white lg:flex lg:flex-col lg:justify-between xl:p-6">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[32px] border-white/10" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full border-[28px] border-[#f3b93d]/20" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#f3b93d] shadow-inner"><GraduationCap size={29} /></div>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f3b93d]">Student portal</p>
                <h2 className="mt-3 max-w-xs font-display text-2xl font-bold leading-tight">Learn. Grow. Achieve.</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Your trusted space for examinations, results and academic progress.</p>
              </div>
              <div className="relative space-y-3 text-sm text-white/85">
                {["Secure student access", "Exams and results in one place", "Support for your academic journey"].map((item) => <div key={item} className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-[#f3b93d]" /> {item}</div>)}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="login-form w-full p-4 sm:p-5 md:p-6">
              <div className="mb-4 text-center sm:mb-5">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff0df] text-[#ed5a00]"><GraduationCap size={21} /></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#ed5a00]">Student portal</p>
                <h1 className="mt-2 text-2xl font-black text-[#173b5f] sm:text-3xl">Welcome back</h1>
                <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>
              </div>
              <div className="login-methods mb-3 flex rounded-2xl bg-[#fff4e8] p-1">
                {[['mobile', 'Mobile Number'], ['email', 'Email']].map(([method, label]) => <button key={method} type="button" onClick={() => { setLoginMethod(method); setId(""); setError(""); }} className={`login-method flex-1 rounded-xl border py-2 text-[12px] font-bold transition-all duration-300 ${loginMethod === method ? "login-method-active" : "login-method-inactive"}`}>{label}</button>)}
              </div>
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-bold text-[#173b5f]">{loginMethod === "mobile" ? "Mobile Number" : "Email Address"}</label>
                <input required value={id} onChange={(e) => setId(e.target.value)} placeholder={loginMethod === "mobile" ? "e.g. 9876543210" : "e.g. student@gmail.com"} type={loginMethod === "email" ? "email" : "tel"} inputMode={loginMethod === "mobile" ? "numeric" : undefined} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#ed5a00] focus:ring-4 focus:ring-[#ed5a00]/10" />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#173b5f]"><LockKeyhole size={15} /> Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all duration-300 focus:border-[#ed5a00] focus:ring-4 focus:ring-[#ed5a00]/10" />
              </div>
              <button type="submit" className="login-submit flex w-full items-center justify-center gap-2 rounded-xl bg-[#ed5a00] py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(237,90,0,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c94c00] hover:shadow-[0_16px_30px_rgba(237,90,0,0.28)]">Login as Student <ArrowRight size={17} /></button>
              <p className="mt-4 text-center text-[13px] text-gray-600">New student? <Link to="/register" className="font-semibold text-[#8B1E3F] transition-colors duration-300 hover:text-[#F07A24]">Register here</Link></p>
              <p className="mt-3 text-center text-[13px]"><Link to="/forgot-password" className="inline-flex items-center gap-1 font-semibold text-[#e85d04] transition-colors duration-300 hover:text-[#8B1E3F]">Forgot password? <ArrowRight size={13} /></Link></p>
              <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400"><ShieldCheck size={13} className="text-[#ed5a00]" /> Secure student sign in</div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import {
  requestPasswordOtp,
  resetStudentPassword,
  verifyPasswordOtp,
} from "../services/backendService.js";

function apiMessage(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  async function sendOtp(event) {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      await requestPasswordOtp(identifier);
      setStep(2);
      setResendIn(30);
      setMessage("OTP sent to your email address.");
    } catch (requestError) {
      setError(apiMessage(requestError, "We could not send the OTP. Please check your details and try again."));
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    clearFeedback();
    setBusy(true);
    try {
      await verifyPasswordOtp(identifier, otp);
      setStep(3);
      setMessage("OTP verified. Create your new password.");
    } catch (verifyError) {
      setError(apiMessage(verifyError, "The OTP is invalid or expired."));
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    clearFeedback();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await resetStudentPassword(identifier, newPassword);
      setStep(4);
      setMessage("Your password has been reset successfully.");
    } catch (resetError) {
      setError(apiMessage(resetError, "We could not reset your password. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function resendOtp() {
    if (resendIn > 0 || busy) return;
    clearFeedback();
    setBusy(true);
    try {
      await requestPasswordOtp(identifier);
      setResendIn(30);
      setMessage("A new OTP has been sent.");
    } catch (requestError) {
      setError(apiMessage(requestError, "We could not resend the OTP right now."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Forgot Password" compact accentTitle />
      <section className="min-h-[calc(100vh-190px)] bg-[#fffaf5] px-4 pb-8 pt-0 md:pb-12 md:pt-0">
        <div className="mx-auto w-full max-w-[500px]">
          <div className="overflow-hidden rounded-[28px] border border-[#ffe0c2] bg-white shadow-[0_18px_45px_rgba(124,45,18,0.1)]">
            <div className="bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_58%,#fffaf5_100%)] px-6 pb-6 pt-7 text-center md:px-9">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e3] text-[#ed6a00]">
                {step === 4 ? <CheckCircle2 size={28} /> : <KeyRound size={28} />}
              </div>
              <h2 className="text-2xl font-black text-navy">{step === 4 ? "Password Updated" : "Recover your account"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step === 1 && "Receive a secure OTP to reset your student password."}
                {step === 2 && "Enter the one-time password sent to you."}
                {step === 3 && "Choose a strong password for your next login."}
                {step === 4 && "Your account is ready. You can now sign in."}
              </p>
            </div>

            <div className="px-6 pb-7 md:px-9">
              {step < 4 && (
                <div className="mb-6 grid grid-cols-3 gap-2" aria-label="Password reset progress">
                  {["Contact", "Verify", "Reset"].map((label, index) => {
                    const number = index + 1;
                    return (
                      <div key={label} className={`border-t-2 pt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] ${step >= number ? "border-[#ff6d00] text-[#c2410c]" : "border-slate-200 text-slate-400"}`}>
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}

              {message && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}
              {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

              {step === 1 && (
                <form onSubmit={sendOtp} className="space-y-5">
                  <div>
                    <label className="label-field">Email address</label>
                    <div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#e85d04]" size={17} /><input required type="email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="student@example.com" className="input-field pl-10" /></div>
                  </div>
                  <button disabled={busy} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Sending OTP..." : "Send OTP"}</button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={verifyOtp} className="space-y-5">
                  <div>
                    <label className="label-field">Enter OTP</label>
                    <input required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit OTP" className="input-field text-center text-lg font-bold tracking-[0.4em]" />
                  </div>
                  <button disabled={busy} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Verifying..." : "Verify OTP"}</button>
                  <button type="button" onClick={resendOtp} disabled={resendIn > 0 || busy} className="w-full text-sm font-semibold text-[#e85d04] disabled:text-slate-400">{resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}</button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={changePassword} className="space-y-5">
                  <div>
                    <label className="label-field">New password</label>
                    <input required minLength={6} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">Confirm new password</label>
                    <input required minLength={6} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input-field" />
                  </div>
                  <button disabled={busy} className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Updating password..." : "Reset Password"}</button>
                </form>
              )}

              {step === 4 && (
                <button type="button" onClick={() => navigate("/login")} className="btn-primary w-full justify-center"><ShieldCheck size={17} /> Continue to Login</button>
              )}

              {step < 4 && <Link to="/login" className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#e85d04]"><ArrowLeft size={16} /> Back to Login</Link>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

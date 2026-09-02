import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, UserCog, GraduationCap } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchExams } from "../services/backendService.js";

const roles = [
  {
    key: "student",
    label: "Student",
    icon: GraduationCap,
    idLabel: "Email or Mobile Number",
    idPlaceholder: "e.g. student@gmail.com or 9876543210",
  },
  {
    key: "coordinator",
    label: "Co-ordinator",
    icon: UserCog,
    idLabel: "Username",
    idPlaceholder: "e.g. coordinator1",
  },
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    idLabel: "Username",
    idPlaceholder: "admin",
  },
];

export default function Login() {
  const [role, setRole] = useState("student");
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginAdmin, loginCoordinator, loginStudent } = useAuth();
  const navigate = useNavigate();

  const current = roles.find((r) => r.key === role);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    let res;

    try {
      if (role === "admin") {
        res = await loginAdmin(id, password);
      } else if (role === "coordinator") {
        res = await loginCoordinator(id, password);
      } else {
        res = await loginStudent(id, password, loginMethod);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed. Please try again.");
      return;
    }

    if (res.success) {
      if (role === "student") {
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
      } else {
        navigate(`/${role}/dashboard`);
      }
    } else {
      setError(res.message || "Invalid credentials.");
    }
  }

  return (
    <div>

      <section className="flex min-h-[calc(100vh-7rem)] items-start overflow-hidden bg-[#fffaf5] pb-6 pt-4 md:pb-8 md:pt-6">
        <div className="container-app flex justify-center">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[400px] rounded-[24px] border border-gray-100 bg-white p-5 shadow-xl md:p-6"
          >

            <div className="mb-4 text-center">

              <div className="flex items-center justify-center gap-3 mb-2">

                <div className="w-8 h-[2px] bg-[#F07A24]"></div>

                <p className="uppercase tracking-[3px] text-[11px] font-semibold text-[#E67E22]">
                  Portal Login
                </p>

                <div className="w-8 h-[2px] bg-[#F07A24]"></div>

              </div>

            </div>

            {/* Role Tabs */}

            <div className="bg-[#F7F0DF] rounded-full p-1 flex mb-5">

              {roles.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setRole(r.key);
                    setError("");
                  }}
                  className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                    role === r.key
                      ? "bg-navy text-white shadow-md"
                      : "text-gray-700 hover:text-navy"
                  }`}
                >
                  {r.label}
                </button>
              ))}

            </div>

            {role === "student" && (
              <div className="mb-4">
                <div className="bg-[#F7F0DF] rounded-full p-1 flex">
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
                      className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
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
            )}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Student accounts support either registered email or mobile number. */}

            <div className="mb-4">

              <label className="block mb-1.5 text-[14px] font-semibold text-navy">
                {role === "student"
                  ? loginMethod === "mobile"
                    ? "Mobile Number"
                    : "Email Address"
                  : current.idLabel}
              </label>

              <input
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={
                  role === "student" && loginMethod === "mobile"
                    ? "e.g. 9876543210"
                    : role === "student"
                    ? "e.g. student@gmail.com"
                    : current.idPlaceholder
                }
                type={role === "student" && loginMethod === "email" ? "email" : "tel"}
                inputMode={role === "student" && loginMethod === "mobile" ? "numeric" : undefined}
                className="w-full rounded-xl border border-gray-200 bg-[#EEF4FF] px-4 py-3 outline-none transition-all duration-300 focus:border-gold focus:ring-2 focus:ring-gold/20"
              />

            </div>

            {/* Password */}

            <div className="mb-5">

              <label className="block mb-1.5 text-[14px] font-semibold text-navy">
                Password
              </label>

              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#EEF4FF] px-4 py-3 outline-none transition-all duration-300 focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
                        {/* Login Button */}

            <button
              type="submit"
              className="
                w-full
                bg-[#F07A24]
                hover:bg-[#DD6D1B]
                text-white
                text-[15px]
                font-semibold
                py-3
                rounded-full
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-xl
              "
            >
              {role === "student"
                ? "Login as Student"
                : role === "coordinator"
                ? "Login as Co-ordinator"
                : "Login as Admin"}
            </button>

            {/* Register */}

            {role === "student" && (
              <p className="mt-4 text-center text-[13px] text-gray-600">
                New student?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#8B1E3F] hover:text-[#F07A24] transition-colors duration-300"
                >
                  Register here
                </Link>
              </p>
            )}

            {role === "student" && (
              <p className="mt-3 text-center text-[13px]">
                <Link to="/forgot-password" className="font-semibold text-[#e85d04] hover:text-[#8B1E3F] transition-colors duration-300">
                  Forgot password?
                </Link>
              </p>
            )}

            

          </form>

        </div>
      </section>
    </div>
  );
}
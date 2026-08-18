import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserCog, GraduationCap } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const roles = [
  {
    key: "student",
    label: "Student",
    icon: GraduationCap,
    idLabel: "Student Email / Mobile",
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
        res = await loginStudent(id, password);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed. Please try again.");
      return;
    }

    if (res.success) {
      if (role === "student") {
        navigate("/student/profile");
      } else {
        navigate(`/${role}/dashboard`);
      }
    } else {
      setError(res.message || "Invalid credentials.");
    }
  }

  return (
    <div>

      <section className="py-12 md:py-16">
        <div className="container-app flex justify-center">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[470px] bg-white rounded-[28px] shadow-xl border border-gray-100 p-6 md:p-7"
          >

            {/* Heading */}

            <div className="text-center mb-5">

              <div className="flex items-center justify-center gap-3 mb-2">

                <div className="w-8 h-[2px] bg-[#F07A24]"></div>

                <p className="uppercase tracking-[3px] text-[11px] font-semibold text-[#E67E22]">
                  Portal Login
                </p>

                <div className="w-8 h-[2px] bg-[#F07A24]"></div>

              </div>

              <h2 className="text-[24px] md:text-[26px] leading-snug font-bold text-navy">
                Welcome back to
                <br />
                Shri Shahu Prabodhini School
              </h2>

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

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* User ID */}

            <div className="mb-4">

              <label className="block mb-1.5 text-[14px] font-semibold text-navy">
                {current.idLabel}
              </label>

              <input
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={current.idPlaceholder}
                className="w-full rounded-xl border border-gray-200 bg-[#EEF4FF] px-4 py-3 outline-none transition-all duration-300 focus:border-[#F0A500] focus:ring-2 focus:ring-[#F0A500]/20"
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
                className="w-full rounded-xl border border-gray-200 bg-[#EEF4FF] px-4 py-3 outline-none transition-all duration-300 focus:border-[#F0A500] focus:ring-2 focus:ring-[#F0A500]/20"
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

            

          </form>

        </div>
      </section>
    </div>
  );
}
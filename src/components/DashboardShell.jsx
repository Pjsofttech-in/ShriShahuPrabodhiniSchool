import React from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardShell({ title, roleLabel, tabs, activeTab, onTabChange, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleViewProfile() {
    navigate("/student/profile");
  }

  return (
    <div className="bg-cream min-h-[80vh]">
      <div className="bg-navy">
        <div className="container-app py-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow !text-gold">{roleLabel} Dashboard</span>
            <h1 className="text-white text-2xl font-bold">Welcome, {user?.name}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {roleLabel === "Student" && (
              <button onClick={handleViewProfile} className="flex items-center gap-2 text-white/80 hover:text-gold text-sm font-semibold border border-white/20 px-4 py-2 rounded-md">
                <User size={16} /> View Profile
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 text-white/80 hover:text-gold text-sm font-semibold border border-white/20 px-4 py-2 rounded-md">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-10 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="card p-3 h-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`w-full text-left px-4 py-3 rounded-md text-sm font-semibold flex items-center gap-2.5 mb-1 transition ${
                activeTab === t.key ? "bg-navy text-white" : "text-ink hover:bg-cream"
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}

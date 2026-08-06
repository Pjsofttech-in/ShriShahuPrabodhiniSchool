import React, { useEffect, useState } from "react";
import { LayoutDashboard, Users } from "lucide-react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchStudents, fetchCenters } from "../../services/backendService.js";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "students", label: "My Students", icon: Users },
];

export default function CoordinatorDashboard() {
  const [tab, setTab] = useState("overview");
  const [center, setCenter] = useState(null);
  const [myStudents, setMyStudents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.centerId) return;

    async function loadData() {
      try {
        const [students, centers] = await Promise.all([
          fetchStudents({ examCenterId: user.centerId }),
          fetchCenters(),
        ]);
        setMyStudents(students);
        setCenter(centers.find((c) => c.id === user.centerId) || null);
      } catch (err) {
        console.error("Could not load coordinator dashboard data", err);
      }
    }

    loadData();
  }, [user]);

  return (
    <DashboardShell title="Coordinator" roleLabel="Coordinator" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && (
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="card p-6">
            <p className="text-xs text-muted font-semibold mb-1">Allocated Center</p>
            <p className="font-display font-bold text-navy text-lg">{center?.centerName}</p>
            <p className="text-sm text-muted mt-1">{center?.district} · {center?.taluka}</p>
          </div>
          <div className="card p-6 text-center">
            <p className="font-display text-3xl font-bold text-navy">{myStudents.length}</p>
            <p className="text-xs text-muted font-medium mt-1">Students at My Center</p>
          </div>
        </div>
      )}
      {tab === "students" && (
        <div className="card p-6 overflow-x-auto">
          <h3 className="font-display font-bold text-navy mb-4">Students Allocated to {center?.centerName}</h3>
          {myStudents.length === 0 ? (
            <p className="text-muted text-sm">No students registered under your center yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-navy/10 text-left">
                  {["Roll No.", "Name", "Class", "Mobile", "School", "Payment"].map((h) => (
                    <th key={h} className="py-2.5 pr-4 font-bold text-navy whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myStudents.map((s) => (
                  <tr key={s.id} className="border-b border-black/5">
                    <td className="py-2.5 pr-4 font-mono text-navy">{s.rollNo}</td>
                    <td className="py-2.5 pr-4 text-muted">{s.name}</td>
                    <td className="py-2.5 pr-4 text-muted">{s.class}</td>
                    <td className="py-2.5 pr-4 text-muted">{s.mobile}</td>
                    <td className="py-2.5 pr-4 text-muted">{s.schoolName}</td>
                    <td className="py-2.5 pr-4 text-muted">{s.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardShell>
  );
}

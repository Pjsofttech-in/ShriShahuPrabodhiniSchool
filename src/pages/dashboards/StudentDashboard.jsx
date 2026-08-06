import React, { useEffect, useState } from "react";
import { LayoutDashboard, User, FileText } from "lucide-react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { fetchStudentById, fetchCoordinators, fetchCenters } from "../../services/backendService.js";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: User },
  { key: "result", label: "My Result", icon: FileText },
];

export default function StudentDashboard() {
  const [tab, setTab] = useState("overview");
  const [student, setStudent] = useState(null);
  const [center, setCenter] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    async function loadData() {
      try {
        const [studentData, centers, coordinators] = await Promise.all([
          fetchStudentById(user.id),
          fetchCenters(),
          fetchCoordinators(),
        ]);
        setStudent(studentData);
        setCenter(centers.find((c) => c.id === studentData?.examCenterId) || null);
        setCoordinator(coordinators.find((c) => c.id === studentData?.coordinatorId) || null);
      } catch (err) {
        console.error("Could not load student dashboard data", err);
      }
    }

    loadData();
  }, [user]);

  if (!student) return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;

  const marks = 70 + (student.rollNo.charCodeAt(student.rollNo.length - 1) % 30);

  return (
    <DashboardShell title="Student" roleLabel="Student" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && (
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="card p-6 text-center"><p className="font-mono font-bold text-navy text-lg">{student.rollNo}</p><p className="text-xs text-muted mt-1">Roll Number</p></div>
          <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{student.class}</p><p className="text-xs text-muted mt-1">Class</p></div>
          <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{student.paymentStatus}</p><p className="text-xs text-muted mt-1">Payment Status</p></div>
        </div>
      )}
      {tab === "profile" && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-navy mb-4">My Profile</h3>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Row label="Name" value={student.name} />
            <Row label="Mobile" value={student.mobile} />
            <Row label="Gender" value={student.gender} />
            <Row label="Class" value={student.class} />
            <Row label="Medium" value={student.medium} />
            <Row label="School" value={student.schoolName} />
            <Row label="Village" value={student.village} />
            <Row label="District / Taluka" value={`${student.district} / ${student.taluka}`} />
            <Row label="Exam Center" value={center?.centerName} />
            <Row label="Co-ordinator" value={coordinator?.name} />
          </dl>
        </div>
      )}
      {tab === "result" && (
        <div className="card p-6 border-l-4 border-gold">
          <h3 className="font-display font-bold text-navy text-lg mb-3">Sankalp Exam Result</h3>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-muted">Roll No.</dt><dd className="font-mono font-bold">{student.rollNo}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Marks Obtained</dt><dd className="font-bold">{marks}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Status</dt><dd className="font-bold text-green-600">{marks >= 40 ? "Pass" : "Fail"}</dd></div>
          </dl>
        </div>
      )}
    </DashboardShell>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-black/5 pb-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold text-navy text-right">{value}</dd>
    </div>
  );
}

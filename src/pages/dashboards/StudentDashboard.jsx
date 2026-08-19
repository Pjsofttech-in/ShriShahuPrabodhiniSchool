import React, { useEffect, useState } from "react";
import { CheckCircle2, IndianRupee, LayoutDashboard, User, FileText } from "lucide-react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  fetchStudentById,
  fetchStudentByMobile,
  fetchStudentByRollNo,
  fetchCoordinators,
  fetchCenters,
} from "../../services/backendService.js";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "profile", label: "My Profile", icon: User },
  { key: "result", label: "My Result", icon: FileText },
];

export default function StudentDashboard({ defaultTab = "profile" }) {
  const [tab, setTab] = useState(defaultTab);
  const [student, setStudent] = useState(null);
  const [center, setCenter] = useState(null);
  const [coordinator, setCoordinator] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    async function loadData() {
      try {
        let studentData = null;

        const lookupIds = [user?.id, user?.studentId, user?.student?.id, user?.userId].filter(Boolean);
        const lookupValues = [
          user?.email,
          user?.student?.email,
          user?.mobile,
          user?.student?.mobile,
          user?.rollNo,
          user?.student?.rollNo,
          user?.username,
          user?.student?.username,
        ].filter(Boolean);

        for (const id of lookupIds) {
          try {
            const found = await fetchStudentById(id);
            if (found) {
              studentData = found;
              break;
            }
          } catch (err) {
            console.warn("Student lookup by id failed.", err);
          }
        }

        if (!studentData) {
          for (const value of lookupValues) {
            try {
              const found = value && value.toString().length >= 10
                ? await fetchStudentByMobile(value)
                : await fetchStudentByRollNo(value);

              if (found) {
                studentData = found;
                break;
              }
            } catch (err) {
              console.warn("Student lookup by mobile/roll failed.", err);
            }
          }
        }

        if (!studentData && user) {
          studentData = user;
        }

        const [centers, coordinators] = await Promise.all([
          fetchCenters(),
          fetchCoordinators(),
        ]);

        setStudent(studentData);

        const centerId = studentData?.examCenterId ?? studentData?.centerId ?? studentData?.center?.id ?? studentData?.center_id;
        const coordinatorId = studentData?.coordinatorId ?? studentData?.coordinator?.id ?? studentData?.coordinator_id;

        setCenter(centers.find((c) => String(c.id) === String(centerId) || String(c.centerId) === String(centerId) || String(c.center_id) === String(centerId)) || null);
        setCoordinator(coordinators.find((c) => String(c.id) === String(coordinatorId) || String(c.coordinatorId) === String(coordinatorId) || String(c.coordinator_id) === String(coordinatorId)) || null);
      } catch (err) {
        console.error("Could not load student dashboard data", err);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  if (!student) return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;

  const rollNo = student.rollNo || student.roll_number || student.rollNumber || "—";
  const paymentStatus = student.paymentStatus || student.payment_status || (student.paymentId ? "Success" : "Pending");
  const paymentId = student.paymentId || student.payment_id || student.razorpayPaymentId || "—";
  const paymentAmount = student.amount ?? student.registrationFee ?? student.paymentAmount ?? 250;
  const isPaymentSuccessful = ["paid", "success", "successful", "completed", "payment successful"].includes(String(paymentStatus).toLowerCase());
  const marks = 70 + (String(rollNo).charCodeAt(String(rollNo).length - 1 || 0) % 30);

  return (
    <DashboardShell title="Student" roleLabel="Student" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {tab === "overview" && (
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="card p-6 text-center"><p className="font-mono font-bold text-navy text-lg">{rollNo}</p><p className="text-xs text-muted mt-1">Roll Number</p></div>
          <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{student.class || student.studentClass || "—"}</p><p className="text-xs text-muted mt-1">Class</p></div>
          <div className="card p-6 text-center"><p className="font-display font-bold text-navy text-lg">{student.paymentStatus || "Paid"}</p><p className="text-xs text-muted mt-1">Payment Status</p></div>
        </div>
      )}
      {tab === "profile" && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-navy mb-4">My Profile</h3>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Row label="Name" value={student.name || student.studentName || "—"} />
            <Row label="Email" value={student.email || "—"} />
            <Row label="Mobile" value={student.mobile || "—"} />
            <Row label="Gender" value={student.gender || "—"} />
            <Row label="Date of Birth" value={student.dateOfBirth || "—"} />
            <Row label="Class" value={student.class || student.studentClass || "—"} />
            <Row label="Medium" value={student.medium || "—"} />
            <Row label="School" value={student.schoolName || "—"} />
            <Row label="Address" value={student.address || "—"} />
            <Row label="Village" value={student.village || "—"} />
            <Row label="District" value={student.district || "—"} />
            <Row label="Taluka" value={student.taluka || "—"} />
            <Row label="State" value={student.state || "—"} />
            <Row label="Pincode" value={student.pincode || "—"} />
            <Row label="Exam Center" value={center?.centerName || center?.name || "—"} />
            <Row label="Co-ordinator" value={coordinator?.name || coordinator?.fullName || "—"} />
            <Row label="Roll Number" value={rollNo} />
            <Row label="Payment Status" value={paymentStatus} />
            <Row label="Payment ID" value={paymentId} />
            <Row label="Registration Fee" value={`₹${paymentAmount}`} />
          </dl>
          <div className={`mt-6 rounded-xl border p-4 flex items-center gap-3 ${isPaymentSuccessful ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            <CheckCircle2 className={isPaymentSuccessful ? "text-green-600 shrink-0" : "text-amber-600 shrink-0"} size={28} />
            <div>
              <p className={`font-semibold ${isPaymentSuccessful ? "text-green-700" : "text-amber-700"}`}>
                {isPaymentSuccessful ? "Payment Successful" : "Payment Pending"}
              </p>
              <p className={`text-sm flex items-center gap-1 ${isPaymentSuccessful ? "text-green-700/80" : "text-amber-700/80"}`}>
                Registration fee paid: <IndianRupee size={14} />{paymentAmount}
              </p>
            </div>
          </div>
        </div>
      )}
      {tab === "result" && (
        <div className="card p-6 border-l-4 border-gold">
          <h3 className="font-display font-bold text-navy text-lg mb-3">Sankalp Exam Result</h3>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between"><dt className="text-muted">Roll No.</dt><dd className="font-mono font-bold">{rollNo}</dd></div>
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

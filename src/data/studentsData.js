export let studentsData = [
  { id: "STU0001", rollNo: "SSP2026-0001", name: "Aarav Kulkarni", mobile: "9765432101", gender: "Male", class: "8th", medium: "Marathi", schoolName: "New English School", schoolAddress: "Sadashiv Peth, Pune", village: "Pune", district: "Pune", taluka: "Haveli", examCenterId: "CTR001", coordinatorId: "CRD001", password: "ssp0001", paymentStatus: "Paid", paymentId: "pay_dummyD1F2G3", amount: 250, registeredOn: "2026-06-14" },
  { id: "STU0002", rollNo: "SSP2026-0002", name: "Sanika Jadhav", mobile: "9822012345", gender: "Female", class: "10th", medium: "Semi-English", schoolName: "Yashwant Vidyalaya", schoolAddress: "Karad Road, Karad", village: "Karad", district: "Satara", taluka: "Karad", examCenterId: "CTR002", coordinatorId: "CRD002", password: "ssp0002", paymentStatus: "Paid", paymentId: "pay_dummyH4J5K6", amount: 250, registeredOn: "2026-06-18" },
];

export function nextRollNumber() {
  const year = new Date().getFullYear();
  const seq = String(studentsData.length + 1).padStart(4, "0");
  return `SSP${year}-${seq}`;
}

export function nextStudentId() {
  return "STU" + String(studentsData.length + 1).padStart(4, "0");
}

export function registerStudent(formData, paymentId) {
  const rollNo = nextRollNumber();
  const id = nextStudentId();
  const password = "ssp" + rollNo.split("-")[1];
  const record = { id, rollNo, ...formData, password, paymentStatus: "Paid", paymentId, amount: 250, registeredOn: new Date().toISOString().slice(0, 10) };
  studentsData = [...studentsData, record];
  return record;
}
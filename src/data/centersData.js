// Dummy Center data — Admin > Settings > Center Form
export const districts = [
  "Pune", "Kolhapur", "Satara", "Sangli", "Solapur", "Nashik", "Ahmednagar"
];

export const talukasByDistrict = {
  Pune: ["Haveli", "Baramati", "Daund", "Shirur", "Maval"],
  Kolhapur: ["Karveer", "Panhala", "Shirol", "Gadhinglaj"],
  Satara: ["Satara", "Karad", "Phaltan", "Wai"],
  Sangli: ["Miraj", "Tasgaon", "Walwa"],
  Solapur: ["North Solapur", "South Solapur", "Barshi"],
  Nashik: ["Nashik", "Malegaon", "Sinnar"],
  Ahmednagar: ["Nagar", "Sangamner", "Shrirampur"],
};

export let centersData = [
  { id: "CTR001", centerName: "Shri Shahu Prabodhini Main Center", district: "Pune", taluka: "Haveli", address: "Near Shivaji Chowk, Pune - 411001", status: "Active" },
  { id: "CTR002", centerName: "Prabodhini Study Center - Karad", district: "Satara", taluka: "Karad", address: "Station Road, Karad - 415110", status: "Active" },
  { id: "CTR003", centerName: "Prabodhini Study Center - Miraj", district: "Sangli", taluka: "Miraj", address: "College Road, Miraj - 416410", status: "Active" },
];

export function addCenter(center) {
  const id = "CTR" + String(centersData.length + 1).padStart(3, "0");
  const newCenter = { id, status: "Active", ...center };
  centersData = [...centersData, newCenter];
  return newCenter;
}
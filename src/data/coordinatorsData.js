export let coordinatorsData = [
  { id: "CRD001", name: "Mr. Rajendra Patil", mobile: "9876543210", email: "rajendra.patil@ssprabodhini.org", address: "Shivaji Nagar, Pune", centerId: "CTR001", username: "coordinator1", password: "coord@123", status: "Active" },
  { id: "CRD002", name: "Mrs. Snehal Deshmukh", mobile: "9822011223", email: "snehal.deshmukh@ssprabodhini.org", address: "Station Road, Karad", centerId: "CTR002", username: "coordinator2", password: "coord@123", status: "Active" },
];

export function addCoordinator(coordinator) {
  const id = "CRD" + String(coordinatorsData.length + 1).padStart(3, "0");
  const username = "coordinator" + (coordinatorsData.length + 1);
  const newCoordinator = { id, username, password: "coord@123", status: "Active", ...coordinator };
  coordinatorsData = [...coordinatorsData, newCoordinator];
  return newCoordinator;
}
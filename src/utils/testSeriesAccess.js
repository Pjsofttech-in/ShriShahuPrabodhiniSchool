const STORAGE_KEY = "ssp_test_series_payments";
const SUCCESS_STATUSES = new Set(["PAID", "SUCCESS", "SUCCESSFUL", "COMPLETED", "CAPTURED", "PAYMENT SUCCESSFUL"]);

function readRecords() {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function isSuccessfulPayment(payment) {
  if (!payment || typeof payment !== "object") return false;
  const status = payment.status ?? payment.paymentStatus ?? payment.payment_status ?? payment.state ?? "";
  return [payment.paymentDone, payment.isPaymentDone, payment.payment_done].some((value) =>
    value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1"
  ) || SUCCESS_STATUSES.has(String(status).trim().toUpperCase());
}

export function getTestSeriesPayments(studentId) {
  const records = Object.entries(readRecords());
  if (!studentId) return Object.fromEntries(records);

  return Object.fromEntries(records.filter(([, payment]) => {
    const paymentStudentId = payment?.studentId ?? payment?.student_id ?? payment?.userId ?? payment?.user_id;
    return paymentStudentId == null || String(paymentStudentId) === String(studentId);
  }));
}

export function getTestSeriesPayment(seriesId, studentId) {
  const matchingPayments = Object.entries(getTestSeriesPayments(studentId)).filter(([key, payment]) =>
    String(payment?.testSeriesId ?? key) === String(seriesId)
  );
  return matchingPayments.length ? matchingPayments[matchingPayments.length - 1][1] : null;
}

export function hasPaidForTestSeries(seriesId, studentId) {
  return Object.entries(getTestSeriesPayments(studentId)).some(([key, payment]) =>
    String(payment?.testSeriesId ?? key) === String(seriesId) && isSuccessfulPayment(payment)
  );
}

export function hasPaidStudentFees(student) {
  const payment = student?.payment ?? student?.latestPayment ?? student?.paymentDetails ?? {};
  const status = student?.paymentStatus ?? student?.payment_status ?? payment.paymentStatus ?? payment.payment_status ?? payment.status ?? "";
  return [
    student?.paymentDone,
    student?.isPaymentDone,
    student?.payment_done,
    payment.paymentDone,
    payment.isPaymentDone,
  ].some((value) => value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1") || [
    "PAID",
    "SUCCESS",
    "SUCCESSFUL",
    "COMPLETED",
    "CAPTURED",
    "PAYMENT SUCCESSFUL",
  ].includes(String(status).trim().toUpperCase());
}

export function saveTestSeriesPayment(seriesId, payment) {
  const records = readRecords();
  const record = {
    ...payment,
    testSeriesId: payment.testSeriesId ?? seriesId,
    status: "PAID",
    paidAt: payment.paidAt || new Date().toISOString(),
  };
  const recordId = record.paymentId || record.orderId || `${Date.now()}`;
  records[`${seriesId}:${recordId}`] = record;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

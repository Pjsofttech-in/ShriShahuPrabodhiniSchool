const STORAGE_KEY = "ssp_test_series_payments";

function readRecords() {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export function getTestSeriesPayments() {
  return readRecords();
}

export function getTestSeriesPayment(seriesId) {
  return readRecords()[String(seriesId)] || null;
}

export function hasPaidForTestSeries(seriesId) {
  const payment = getTestSeriesPayment(seriesId);
  return Boolean(payment && ["PAID", "SUCCESS", "SUCCESSFUL", "COMPLETED", "CAPTURED"].includes(String(payment.status).toUpperCase()));
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
  records[String(seriesId)] = { ...payment, status: "PAID", paidAt: payment.paidAt || new Date().toISOString() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records[String(seriesId)];
}

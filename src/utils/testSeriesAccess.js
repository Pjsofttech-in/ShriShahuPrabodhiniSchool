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
  const statuses = [
    payment.status,
    payment.paymentStatus,
    payment.payment_status,
    payment.paymentStatusName,
    payment.payment_status_name,
    payment.transactionStatus,
    payment.transaction_status,
    payment.state,
    payment.transaction?.status,
    payment.gatewayResponse?.status,
  ];
  return [payment.paymentDone, payment.isPaymentDone, payment.payment_done, payment.isPaid, payment.paid, payment.paymentCompleted, payment.payment_completed, payment.verified]
    .some((value) =>
    value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1"
  ) || statuses.some((status) => SUCCESS_STATUSES.has(String(status ?? "").trim().toUpperCase()));
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
  const statuses = [
    student?.paymentStatus,
    student?.payment_status,
    student?.paymentStatusName,
    student?.payment_status_name,
    payment.paymentStatus,
    payment.payment_status,
    payment.paymentStatusName,
    payment.payment_status_name,
    payment.transactionStatus,
    payment.transaction_status,
    payment.status,
    payment.state,
  ];
  return [
    student?.paymentDone,
    student?.isPaymentDone,
    student?.payment_done,
    student?.isPaid,
    student?.paid,
    student?.paymentCompleted,
    student?.payment_completed,
    payment.paymentDone,
    payment.isPaymentDone,
    payment.isPaid,
    payment.paid,
    payment.paymentCompleted,
    payment.payment_completed,
  ].some((value) => value === true || value === 1 || String(value).toLowerCase() === "true" || String(value) === "1") || statuses.some((status) => SUCCESS_STATUSES.has(String(status ?? "").trim().toUpperCase()));
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

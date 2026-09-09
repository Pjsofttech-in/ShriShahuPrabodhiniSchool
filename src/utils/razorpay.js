// Razorpay checkout helper. Order creation and signature verification happen on the API.
// Never put the Razorpay key secret in Vite environment variables or frontend code.

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay Checkout modal.
 * @param {Object} opts
 * @param {number} opts.amount - Amount in INR (rupees), e.g. 250
 * @param {number} opts.amountInPaise - Server-created order amount in paise
 * @param {string} opts.name - Student / payer name
 * @param {string} opts.email - Payer email (optional)
 * @param {string} opts.contact - Payer mobile number
 * @param {Function} opts.onSuccess - called with { paymentId, orderId, signature } on success
 * @param {Function} opts.onFailure - called with (error) on failure/cancel
 */
export async function payWithRazorpay({ amount, amountInPaise, currency = "INR", name, email, contact, orderId, onSuccess, onFailure }) {
  console.log("Razorpay Live Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);
  console.log("Razorpay Order ID:", orderId);

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_ID.startsWith("rzp_live_")) {
    console.error("Invalid Razorpay Live Key ID.");
    onFailure && onFailure("Razorpay Live configuration is missing or invalid.");
    return;
  }

  if (!orderId || !String(orderId).startsWith("order_")) {
    console.error("Invalid Razorpay Order ID:", orderId);
    onFailure && onFailure("Invalid Razorpay order received from the server.");
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure && onFailure("Could not load Razorpay SDK. Check your internet connection.");
    return;
  }

  if (!window.Razorpay) {
    onFailure && onFailure("Razorpay Checkout failed to load.");
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: Number.isFinite(Number(amountInPaise)) ? Number(amountInPaise) : amount * 100,
    currency: currency || "INR",
    name: "Shri Shahu Prabodhini",
    description: "Sankalp Scholarship Exam Registration Fee",
    order_id: orderId,
    handler: function (response) {
      onSuccess && onSuccess({
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
      });
    },
    prefill: { name, email, contact },
    theme: { color: "#0B2545" },
    modal: {
      ondismiss: function () {
        onFailure && onFailure("Payment popup closed before completion.");
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", function (response) {
    onFailure && onFailure(response.error.description || "Payment failed.");
  });
  rzp.open();
}

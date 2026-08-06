// Razorpay integration helper.
//
// SETUP FOR THE CLIENT / DEVELOPER:
// 1. Create a Razorpay account -> https://dashboard.razorpay.com/
// 2. Get your Key ID (test mode: rzp_test_xxxx, live mode: rzp_live_xxxx)
// 3. Replace RAZORPAY_KEY_ID below with your real key.
// 4. In production, the "order" MUST be created on your backend (Razorpay Orders API)
//    using your Key Secret — never expose the Key Secret in frontend code.
//    This dummy version simulates that order-creation step on the client only,
//    for demo purposes, and should be swapped for a real API call, e.g.:
//      const order = await fetch('/api/create-order', { method: 'POST', ... }).then(r => r.json())
//
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_XXXXXXXXXXXX";

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
 * @param {string} opts.name - Student / payer name
 * @param {string} opts.email - Payer email (optional)
 * @param {string} opts.contact - Payer mobile number
 * @param {Function} opts.onSuccess - called with (paymentId) on success
 * @param {Function} opts.onFailure - called with (error) on failure/cancel
 */
export async function payWithRazorpay({ amount, name, email, contact, orderId, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure && onFailure("Could not load Razorpay SDK. Check your internet connection.");
    return;
  }

  // DEMO MODE: since there is no live backend in this dummy build, we simulate
  // a successful checkout when a real Key ID hasn't been configured yet, so the
  // rest of the registration flow (roll no. + login) can still be demonstrated.
  if (RAZORPAY_KEY_ID.includes("XXXX")) {
    const confirmed = window.confirm(
      `Demo Payment Gateway\n\nAmount: ₹${amount}\nName: ${name}\n\n(No real Razorpay key configured yet — click OK to simulate a successful payment.)`
    );
    if (confirmed) {
      onSuccess && onSuccess("pay_demo_" + Math.random().toString(36).slice(2, 12));
    } else {
      onFailure && onFailure("Payment cancelled by user.");
    }
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Razorpay expects paise
    currency: "INR",
    name: "Shri Shahu Prabodhini",
    description: "Sankalp Scholarship Exam Registration Fee",
    order_id: orderId,
    handler: function (response) {
      onSuccess && onSuccess(response.razorpay_payment_id);
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

import React from "react";
import PageHeader from "../components/PageHeader.jsx";

export default function RefundPolicy() {
  return (
    <div>
      <PageHeader title="Refund Policy" />
      <section className="section-pad">
        <div className="container-app max-w-3xl space-y-6 text-muted leading-relaxed text-sm">
          <p>
            This Refund Policy applies to the registration fee paid for the Maha Talent Scholarship
            Exam through our Razorpay payment gateway.
          </p>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">General Policy</h2>
            <p>Registration fees, once paid and a roll number generated, are generally
              non-refundable, since a seat and exam material are reserved for the student
              immediately upon successful payment.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Eligible Refund Cases</h2>
            <p>A refund may be considered only in the following situations: (1) the amount was
              debited from your account but registration failed on our portal, (2) duplicate
              payment was made for the same student, or (3) the exam is cancelled or
              rescheduled by Shri Shahu Prabodhini and the student opts out.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Refund Process & Timeline</h2>
            <p>Eligible refunds are processed back to the original payment method via Razorpay
              within 7–10 business days of approval. Please contact us with your payment ID and
              roll number to raise a refund request.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Contact for Refunds</h2>
            <p>Raise your request through our Contact Us page along with the transaction details.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

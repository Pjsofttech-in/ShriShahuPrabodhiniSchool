import React from "react";
import PageHeader from "../components/PageHeader.jsx";

export default function TermsAndConditions() {
  return (
    <div>
      <PageHeader title="Terms and Conditions" />
      <section className="section-pad">
        <div className="container-app max-w-3xl space-y-6 text-muted leading-relaxed text-sm">
          <p>
            These Terms and Conditions apply to the use of the Shri Shahu Prabodhini website
            and registration for the Sankalp Scholarship Examination. By registering, the
            student and parent or guardian agree to follow these terms.
          </p>

          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Student Registration</h2>
            <p>
              All information provided during registration must be complete, accurate and up to
              date. The student or parent/guardian is responsible for checking the student name,
              date of birth, class, school, contact details and selected exam center before
              submitting the form.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Registration Payment</h2>
            <p>
              The Sankalp Scholarship Examination registration fee is ₹250 per student. Payment
              is processed securely through Razorpay. Registration is completed only after the
              payment is successfully verified by our system. A payment receipt or transaction
              reference should be retained for future communication.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Payment Failure or Duplicate Payment</h2>
            <p>
              If money is debited but registration is not completed, or if a duplicate payment
              is made, please contact us with the payment ID and transaction details. Eligible
              refunds are handled according to our Refund Policy and are normally returned to
              the original payment method.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Exam Center and Communication</h2>
            <p>
              The selected exam center and coordinator are subject to availability and
              administrative confirmation. Students and parents/guardians must review updates
              shared through the registered mobile number or email and follow the instructions
              issued by Shri Shahu Prabodhini and the assigned center.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Student Account</h2>
            <p>
              Login credentials generated after registration must be kept confidential. The
              student or parent/guardian is responsible for activity performed using the account
              and must notify us if the credentials are lost or misused.
            </p>
          </div>

          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Changes and Contact</h2>
            <p>
              Shri Shahu Prabodhini may update exam details or these terms when necessary. The
              latest version will be published on this page. For questions about registration,
              payment or these terms, please contact us through the Contact Us page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

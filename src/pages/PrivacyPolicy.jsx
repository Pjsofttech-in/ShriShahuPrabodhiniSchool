import React from "react";
import PageHeader from "../components/PageHeader.jsx";

export default function PrivacyPolicy() {
  return (
    <div>
      <PageHeader title="Privacy Policy" />
      <section className="section-pad">
        <div className="container-app max-w-3xl prose-content space-y-6 text-muted leading-relaxed text-sm">
          <p>
            Shri Shahu Prabodhini ("we", "us") respects the privacy of every visitor, student
            and parent using this website and the Maha Talent Online Exam portal. This policy
            explains what information we collect and how it is used.
          </p>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Information We Collect</h2>
            <p>Name, mobile number, email, school details, class, medium, address and payment
              reference information submitted during student registration, and any message
              details submitted through our Contact Us form.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">How We Use Your Information</h2>
            <p>To process exam registration, generate roll numbers and login credentials,
              allocate students to the correct exam center and coordinator, publish results,
              and communicate important exam updates.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Payment Information</h2>
            <p>Registration fee payments are processed securely through Razorpay. We do not
              store your card, UPI or net-banking credentials on our servers — these are
              handled entirely by Razorpay's PCI-DSS compliant systems.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Data Sharing</h2>
            <p>Student data is shared only with the allocated exam center and coordinator for
              administrative purposes. We do not sell or rent personal information to third
              parties.</p>
          </div>
          <div>
            <h2 className="font-display font-bold text-navy text-lg mb-2">Contact</h2>
            <p>For any privacy-related questions, please reach us via our Contact Us page.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

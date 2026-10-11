
import React from "react";

export default function App2() {
  const handlePayment = () => {
    alert("Please integrate your payment gateway here.");
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .premium-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #fff8f1, #ffffff, #fff0e2);
          color: #252525;
        }

        .premium-card {
          width: 100%;
          max-width: 490px;
          padding: 42px 34px;
          background: #ffffff;
          border: 1px solid #ffe1ca;
          border-radius: 26px;
          text-align: center;
          box-shadow: 0 18px 55px rgba(180, 85, 25, 0.12);
          animation: fadeIn 0.6s ease;
        }

        .premium-icon {
          width: 82px;
          height: 82px;
          margin: 0 auto 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          background: #fff0e3;
          color: #f47721;
          font-size: 39px;
        }

        .premium-badge {
          display: inline-block;
          padding: 8px 15px;
          margin-bottom: 18px;
          border-radius: 30px;
          background: #fff1e6;
          color: #e66b16;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .premium-title {
          margin: 0 0 14px;
          font-size: clamp(27px, 5vw, 35px);
          line-height: 1.25;
          font-weight: 850;
          letter-spacing: -1px;
          color: #222222;
        }

        .premium-title span {
          color: #f47721;
        }

        .premium-description {
          max-width: 360px;
          margin: 0 auto 28px;
          color: #777777;
          font-size: 15px;
          line-height: 1.8;
        }

        .premium-divider {
          height: 1px;
          background: #f2eee9;
          margin: 25px 0;
        }

        .premium-features {
          list-style: none;
          text-align: left;
          padding: 0;
          margin: 0 0 28px;
        }

        .premium-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #444444;
        }

        .feature-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #fff0e3;
          color: #ed741d;
          font-weight: 900;
        }

        .premium-payment-btn {
          width: 100%;
          padding: 17px 20px;
          border: none;
          border-radius: 13px;
          background: linear-gradient(135deg, #ff922e, #f26516);
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(242, 101, 22, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .premium-payment-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(242, 101, 22, 0.32);
        }

        .premium-payment-btn:active {
          transform: scale(0.98);
        }

        .premium-secure {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          margin-top: 19px;
          color: #888888;
          font-size: 12px;
        }

        .premium-footer {
          margin-top: 26px;
          color: #aaaaaa;
          font-size: 12px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .premium-page {
            padding: 16px;
          }

          .premium-card {
            padding: 32px 23px;
            border-radius: 22px;
          }

          .premium-title {
            font-size: 28px;
          }
        }
      `}</style>

      <main className="premium-page">
        <section className="premium-card">
          <div className="premium-icon">♛</div>

          <div className="premium-badge">
            ✦ PREMIUM MEMBERSHIP
          </div>

          <h1 className="premium-title">
            Please Complete
            <br />
            <span>Payment First</span>
          </h1>

          <p className="premium-description">
            Unlock your premium experience! Complete your
            payment to access exclusive features and continue
            enjoying all the benefits.
          </p>

          <div className="premium-divider" />

          <ul className="premium-features">
            <li>
              <span className="feature-check">✓</span>
              Full access to premium content
            </li>
            <li>
              <span className="feature-check">✓</span>
              Exclusive features and benefits
            </li>
            <li>
              <span className="feature-check">✓</span>
              A seamless, ad-free experience
            </li>
            <li>
              <span className="feature-check">✓</span>
              Priority access to new updates
            </li>
          </ul>

          <button
            className="premium-payment-btn"
            onClick={handlePayment}
          >
            Complete Your Payment →
          </button>

          <div className="premium-secure">
            <span>🔒</span>
            Secure payment · Your information stays protected
          </div>

          <div className="premium-footer">
            © {new Date().getFullYear()} Premium Membership
            <br />
            Questions? Contact our support team.
          </div>
        </section>
      </main>
    </>
  );
}
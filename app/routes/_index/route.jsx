import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .ss-public-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(79,70,229,0.10) 0%, rgba(79,70,229,0) 28%),
            linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
          padding: 32px 20px;
          font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .ss-public-wrap {
          max-width: 1180px;
          margin: 0 auto;
        }

        .ss-topbar {
          background: linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%);
          border-radius: 28px;
          padding: 18px 20px;
          color: #ffffff;
          box-shadow: 0 24px 60px rgba(15,23,42,0.18);
          margin-bottom: 24px;
        }

        .ss-badge {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.10em;
          text-transform: uppercase;
        }

        .ss-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 32px;
          padding: 56px 48px;
          box-shadow: 0 18px 50px rgba(15,23,42,0.08);
        }

        .ss-hero {
          max-width: 920px;
          margin: 0 auto;
          text-align: center;
        }

        .ss-heading {
          margin: 0;
          font-size: 58px;
          line-height: 1.02;
          letter-spacing: -0.05em;
          font-weight: 800;
          color: #0f172a;
        }

        .ss-text {
          margin: 18px auto 0;
          max-width: 980px;
          font-size: 18px;
          line-height: 1.85;
          color: #475467;
          font-weight: 500;
        }

        .ss-form-wrap {
          max-width: 760px;
          margin: 36px auto 0;
          padding: 24px;
          border-radius: 24px;
          background: linear-gradient(180deg, #fafbff 0%, #f8fafc 100%);
          border: 1px solid rgba(79,70,229,0.10);
          box-shadow: 0 10px 30px rgba(15,23,42,0.05);
        }

        .ss-form-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: end;
        }

        .ss-label {
          display: block;
        }

        .ss-label-title {
          display: block;
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }

        .ss-input {
          width: 100%;
          height: 56px;
          border-radius: 16px;
          border: 1px solid rgba(15,23,42,0.12);
          padding: 0 18px;
          font-size: 16px;
          color: #111827;
          background: #ffffff;
          outline: none;
          box-sizing: border-box;
        }

        .ss-input-note {
          display: block;
          margin-top: 10px;
          font-size: 13px;
          color: #667085;
          font-weight: 500;
        }

        .ss-button {
          height: 56px;
          padding: 0 24px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(79,70,229,0.28);
        }

        .ss-features {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin: 34px 0 0 0;
        }

        .ss-feature-card {
          background: #ffffff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(15,23,42,0.05);
        }

        .ss-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 16px;
        }

        .ss-feature-title {
          font-size: 22px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
          margin-bottom: 10px;
        }

        .ss-feature-text {
          color: #667085;
          line-height: 1.8;
          font-size: 15px;
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .ss-card {
            padding: 36px 24px;
            border-radius: 24px;
          }

          .ss-heading {
            font-size: 42px;
            line-height: 1.08;
          }

          .ss-text {
            font-size: 16px;
            line-height: 1.75;
          }

          .ss-features {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .ss-public-page {
            padding: 16px 12px 24px;
          }

          .ss-topbar {
            border-radius: 20px;
            padding: 14px;
            margin-bottom: 16px;
          }

          .ss-badge {
            font-size: 11px;
            padding: 8px 12px;
            letter-spacing: 0.08em;
          }

          .ss-card {
            padding: 24px 16px;
            border-radius: 20px;
          }

          .ss-heading {
            font-size: 30px;
            line-height: 1.12;
          }

          .ss-text {
            margin-top: 14px;
            font-size: 15px;
            line-height: 1.7;
          }

          .ss-form-wrap {
            margin-top: 24px;
            padding: 16px;
            border-radius: 18px;
          }

          .ss-form-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .ss-input {
            height: 52px;
            font-size: 15px;
            border-radius: 14px;
          }

          .ss-button {
            width: 100%;
            height: 52px;
            border-radius: 14px;
          }

          .ss-features {
            margin-top: 22px;
            gap: 12px;
          }

          .ss-feature-card {
            border-radius: 18px;
            padding: 18px;
          }

          .ss-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            margin-bottom: 12px;
          }

          .ss-feature-title {
            font-size: 18px;
            margin-bottom: 8px;
          }

          .ss-feature-text {
            font-size: 14px;
            line-height: 1.7;
          }
        }
      `}</style>

      <div className={`${styles.index} ss-public-page`}>
        <div className={`${styles.content} ss-public-wrap`}>
          <div className="ss-topbar">
            <div className="ss-badge">Simpli Sections</div>
          </div>

          <div className="ss-card">
            <div className="ss-hero">
              <h1 className={`${styles.heading} ss-heading`}>
                Premium Shopify sections built for conversions
              </h1>

              <p className={`${styles.text} ss-text`}>
                Add conversion-focused Shopify sections like offer bars and trust
                badges without editing theme code. Install the app and unlock
                premium sections directly inside your Shopify admin.
              </p>
            </div>

            {showForm && (
              <div className="ss-form-wrap">
                <Form className={`${styles.form} ss-form-grid`} method="post" action="/auth/login">
                  <label className={`${styles.label} ss-label`}>
                    <span className="ss-label-title">Enter your Shopify store domain</span>

                    <input
                      className={`${styles.input} ss-input`}
                      type="text"
                      name="shop"
                      placeholder="your-store.myshopify.com"
                    />

                    <span className="ss-input-note">Example: your-store.myshopify.com</span>
                  </label>

                  <button className={`${styles.button} ss-button`} type="submit">
                    Continue
                  </button>
                </Form>
              </div>
            )}

            <div className={`${styles.list} ss-features`}>
              <div className="ss-feature-card">
                <div
                  className="ss-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.10) 100%)",
                  }}
                >
                  ★
                </div>
                <div className="ss-feature-title">Premium sections</div>
                <div className="ss-feature-text">
                  Launch ready-made Shopify app blocks designed to improve store
                  presentation and conversions.
                </div>
              </div>

              <div className="ss-feature-card">
                <div
                  className="ss-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.10) 100%)",
                  }}
                >
                  ↗
                </div>
                <div className="ss-feature-title">Fast setup</div>
                <div className="ss-feature-text">
                  Purchase a section, add it from the theme customizer, and
                  start using it without custom development.
                </div>
              </div>

              <div className="ss-feature-card">
                <div
                  className="ss-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.10) 100%)",
                  }}
                >
                  ◎
                </div>
                <div className="ss-feature-title">Flexible access</div>
                <div className="ss-feature-text">
                  Buy individual sections or unlock the full library with the
                  unlimited plan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
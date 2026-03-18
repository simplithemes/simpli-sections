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
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        className={styles.index}
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, rgba(79,70,229,0.10) 0%, rgba(79,70,229,0) 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
          padding: "32px 20px",
          fontFamily:
            '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          className={styles.content}
          style={{
            maxWidth: 1180,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%)",
              borderRadius: 28,
              padding: "18px 20px",
              color: "#ffffff",
              boxShadow: "0 24px 60px rgba(15,23,42,0.18)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              Simpli Sections
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 32,
              padding: "56px 48px",
              boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                maxWidth: 920,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              <h1
                className={styles.heading}
                style={{
                  margin: 0,
                  fontSize: 58,
                  lineHeight: 1.02,
                  letterSpacing: "-0.05em",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                Premium Shopify sections built for conversions
              </h1>

              <p
                className={styles.text}
                style={{
                  margin: "18px auto 0",
                  maxWidth: 980,
                  fontSize: 18,
                  lineHeight: 1.85,
                  color: "#475467",
                  fontWeight: 500,
                }}
              >
                Add conversion-focused Shopify sections like offer bars and trust
                badges without editing theme code. Install the app and unlock
                premium sections directly inside your Shopify admin.
              </p>
            </div>

            {showForm && (
              <div
                style={{
                  maxWidth: 760,
                  margin: "36px auto 0",
                  padding: 24,
                  borderRadius: 24,
                  background:
                    "linear-gradient(180deg, #fafbff 0%, #f8fafc 100%)",
                  border: "1px solid rgba(79,70,229,0.10)",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                }}
              >
                <Form
                  className={styles.form}
                  method="post"
                  action="/auth/login"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 14,
                    alignItems: "end",
                  }}
                >
                  <label
                    className={styles.label}
                    style={{
                      display: "block",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        marginBottom: 10,
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      Enter your Shopify store domain
                    </span>

                    <input
                      className={styles.input}
                      type="text"
                      name="shop"
                      placeholder="your-store.myshopify.com"
                      style={{
                        width: "100%",
                        height: 56,
                        borderRadius: 16,
                        border: "1px solid rgba(15,23,42,0.12)",
                        padding: "0 18px",
                        fontSize: 16,
                        color: "#111827",
                        background: "#ffffff",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />

                    <span
                      style={{
                        display: "block",
                        marginTop: 10,
                        fontSize: 13,
                        color: "#667085",
                        fontWeight: 500,
                      }}
                    >
                      Example: your-store.myshopify.com
                    </span>
                  </label>

                  <button
                    className={styles.button}
                    type="submit"
                    style={{
                      height: 56,
                      padding: "0 24px",
                      borderRadius: 16,
                      border: "none",
                      background:
                        "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 14px 28px rgba(79,70,229,0.28)",
                    }}
                  >
                    Continue
                  </button>
                </Form>
              </div>
            )}

            <div
              className={styles.list}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 18,
                listStyle: "none",
                padding: 0,
                margin: "34px 0 0 0",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(124,58,237,0.10) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    marginBottom: 16,
                  }}
                >
                  ★
                </div>
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.15,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Premium sections
                </div>
                <div
                  style={{
                    color: "#667085",
                    lineHeight: 1.8,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  Launch ready-made Shopify app blocks designed to improve store
                  presentation and conversions.
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.10) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    marginBottom: 16,
                  }}
                >
                  ↗
                </div>
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.15,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Fast setup
                </div>
                <div
                  style={{
                    color: "#667085",
                    lineHeight: 1.8,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  Purchase a section, add it from the theme customizer, and
                  start using it without custom development.
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 24,
                  padding: 24,
                  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.10) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    marginBottom: 16,
                  }}
                >
                  ◎
                </div>
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.15,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#111827",
                    marginBottom: 10,
                  }}
                >
                  Flexible access
                </div>
                <div
                  style={{
                    color: "#667085",
                    lineHeight: 1.8,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
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
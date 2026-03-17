import { useLocation } from "react-router";

export default function AppHome() {
  const location = useLocation();
  const qs = location.search || "";

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "32px 24px 40px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111827",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
          borderRadius: 24,
          padding: "36px 32px",
          color: "#ffffff",
          boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Simpli Sections
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            fontWeight: 800,
            maxWidth: 760,
          }}
        >
          Premium Shopify sections to boost conversions
        </h1>

        <p
          style={{
            margin: "16px 0 0 0",
            maxWidth: 760,
            fontSize: 16,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Add premium sections like Pro Offer Bar and Trust Badges to your
          Shopify store without editing theme code.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 22,
          }}
        >
          <a
            href={`/app/billing${qs}`}
            style={{
              display: "inline-block",
              padding: "14px 18px",
              borderRadius: 14,
              background: "#ffffff",
              color: "#111827",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Browse Sections
          </a>

          <a
            href={`/app/additional${qs}`}
            style={{
              display: "inline-block",
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            My Sections
          </a>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 22,
            padding: 22,
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: 24,
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Pro Offer Bar
          </h2>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            Highlight special offers, discount messages, and promotional
            campaigns in a premium app block layout.
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 22,
            padding: 22,
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: 24,
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Trust Badges
          </h2>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            Show secure checkout, shipping, returns, and quality assurance
            badges in a premium layout.
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 22,
          padding: 22,
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <h2
          style={{
            margin: "0 0 14px 0",
            fontSize: 24,
            lineHeight: 1.2,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          How it works
        </h2>

        <div style={{ color: "#6b7280", lineHeight: 1.9, fontSize: 15 }}>
          <div>1. Open Browse Sections and choose the section you want.</div>
          <div>2. Approve the one-time purchase or unlock the unlimited plan.</div>
          <div>3. Go to Online Store → Customize and add the Simpli Sections app block.</div>
          <div>4. Customize the design and publish your theme.</div>
        </div>
      </div>
    </div>
  );
}
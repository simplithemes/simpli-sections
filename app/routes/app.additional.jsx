import { useLoaderData, useLocation } from "react-router";
import { authenticate } from "../shopify.server";

const META_NAMESPACE = "simpli_sections";
const META_KEY = "unlocked_sections";

const LIVE_SECTIONS = [
  {
    handle: "pro_offer_bar",
    title: "Pro Offer Bar",
    description:
      "Highlight special offers, discount messages, and promotional campaigns in a premium app block layout.",
  },
  {
    handle: "trust_badges",
    title: "Trust Badges",
    description:
      "Show secure checkout, shipping, returns, and quality assurance badges in a premium layout.",
  },
];

async function getSectionAccess(admin) {
  const query = `#graphql
    query {
      shop {
        metafield(namespace: "${META_NAMESPACE}", key: "${META_KEY}") {
          value
        }
      }
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
          test
        }
      }
    }
  `;

  const resp = await admin.graphql(query);
  const json = await resp.json();

  const unlockedValue = json?.data?.shop?.metafield?.value || "";
  const unlocked = unlockedValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const activeSubscriptions =
    json?.data?.currentAppInstallation?.activeSubscriptions || [];

  const hasUnlimitedPlan = activeSubscriptions.some(
    (sub) =>
      sub?.name === "Simpli Sections — Unlimited Access" &&
      sub?.status === "ACTIVE",
  );

  return {
    unlocked,
    activeSubscriptions,
    hasUnlimitedPlan,
  };
}

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const { unlocked, activeSubscriptions, hasUnlimitedPlan } =
    await getSectionAccess(admin);

  return {
    unlocked,
    activeSubscriptions,
    hasUnlimitedPlan,
    sections: LIVE_SECTIONS,
  };
}

function SectionCard({ section, unlocked, browseHref }) {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 22,
        padding: 20,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.2,
              fontWeight: 800,
              color: "#101828",
              letterSpacing: "-0.02em",
            }}
          >
            {section.title}
          </h3>
        </div>

        <div
          style={{
            padding: "7px 11px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: unlocked ? "#e8f7ee" : "#f4f4f5",
            color: unlocked ? "#157347" : "#3f3f46",
            whiteSpace: "nowrap",
          }}
        >
          {unlocked ? "Unlocked" : "Locked"}
        </div>
      </div>

      <p
        style={{
          margin: "0 0 16px 0",
          color: "#667085",
          lineHeight: 1.75,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {section.description}
      </p>

      {unlocked ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 15px",
            borderRadius: 12,
            background: "#101828",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Available in your library
        </div>
      ) : (
        <a
          href={browseHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 15px",
            borderRadius: 12,
            background: "#f4f4f5",
            color: "#52525b",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Unlock from Browse Sections
        </a>
      )}
    </div>
  );
}

export default function AdditionalPage() {
  const data = useLoaderData();
  const location = useLocation();
  const qs = location.search || "";

  const unlockedCount = data.hasUnlimitedPlan
    ? data.sections.length
    : data.sections.filter((section) => data.unlocked.includes(section.handle))
        .length;

  const browseHref = `/app/billing${qs}`;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          padding: 24,
          maxWidth: 1180,
          margin: "0 auto",
          fontFamily:
            '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: "#101828",
        }}
      >
        <div
          style={{
            borderRadius: 30,
            padding: "32px 32px 28px",
            background:
              "radial-gradient(circle at top left, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 28%), linear-gradient(135deg, #081226 0%, #0b1731 45%, #1b2a44 100%)",
            color: "#ffffff",
            marginBottom: 22,
            boxShadow: "0 18px 40px rgba(2,6,23,0.18)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              marginBottom: 16,
            }}
          >
            My Sections
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 46,
              lineHeight: 1.04,
              letterSpacing: "-0.05em",
              fontWeight: 800,
              maxWidth: 760,
            }}
          >
            Your unlocked Simpli Sections library
          </h1>

          <p
            style={{
              margin: "16px 0 0 0",
              maxWidth: 760,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.8,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            View the premium sections available in your account and quickly see
            which ones are ready to use in your theme editor.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(300px, 1fr)",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: 22,
              background: "#ffffff",
              boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 12,
                color: "#101828",
                letterSpacing: "-0.02em",
              }}
            >
              Access summary
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#667085",
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Plan
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#101828",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {data.hasUnlimitedPlan ? "Unlimited" : "Section Access"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#667085",
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Unlocked
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#101828",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {unlockedCount}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "#f8fafc",
                  border: "1px solid rgba(15,23,42,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#667085",
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: data.hasUnlimitedPlan ? "#157347" : "#101828",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {data.hasUnlimitedPlan ? "Active" : "Pay per section"}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: 22,
              background: "#ffffff",
              boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                marginBottom: 12,
                color: "#101828",
                letterSpacing: "-0.02em",
              }}
            >
              Current plan
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                background: data.hasUnlimitedPlan ? "#e8f7ee" : "#f4f4f5",
                color: data.hasUnlimitedPlan ? "#157347" : "#3f3f46",
                fontWeight: 700,
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              {data.hasUnlimitedPlan
                ? "Unlimited Active"
                : "No active unlimited plan"}
            </div>

            <p
              style={{
                margin: 0,
                color: "#667085",
                lineHeight: 1.8,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {data.hasUnlimitedPlan
                ? "You currently have access to all premium sections included in your plan."
                : "You currently have access only to individually purchased sections. You can unlock more anytime from Browse Sections."}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <h2
            style={{
              margin: "0 0 14px 0",
              fontSize: 28,
              letterSpacing: "-0.03em",
              color: "#101828",
              fontWeight: 800,
            }}
          >
            Section library
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {data.sections.map((section) => {
              const unlocked =
                data.hasUnlimitedPlan || data.unlocked.includes(section.handle);

              return (
                <SectionCard
                  key={section.handle}
                  section={section}
                  unlocked={unlocked}
                  browseHref={browseHref}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
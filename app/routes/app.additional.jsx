import { useLoaderData, useLocation } from "react-router";
import { authenticate } from "../shopify.server";
import { SECTION_CATALOG } from "../data/sections";

const META_NAMESPACE = "simpli_sections";
const META_KEY = "unlocked_sections";

function getTemplateFromPlacement(placement = "") {
  const value = placement.toLowerCase();

  if (value.includes("cart")) return "cart";
  if (value.includes("homepage")) return "index";
  if (value.includes("product")) return "product";

  return "product";
}

function buildThemeEditorUrl({
  shop,
  apiKey,
  blockHandle,
  template = "product",
}) {
  const params = new URLSearchParams();

  params.set("template", template);
  params.set("target", "mainSection");
  params.set("addAppBlockId", `${apiKey}/${blockHandle}`);

  if (shop) {
    return `https://${shop}/admin/themes/current/editor?${params.toString()}`;
  }

  return `/admin/themes/current/editor?${params.toString()}`;
}

async function getSectionAccess(admin) {
  const query = `#graphql
    query {
      shop {
        myshopifyDomain
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
    shop: json?.data?.shop?.myshopifyDomain || "",
    unlocked,
    activeSubscriptions,
    hasUnlimitedPlan,
  };
}

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const { shop, unlocked, activeSubscriptions, hasUnlimitedPlan } =
    await getSectionAccess(admin);

  const liveSections = SECTION_CATALOG.filter(
    (section) => section.status === "live",
  );

  return {
    shop,
    apiKey: process.env.SHOPIFY_API_KEY || "",
    unlocked,
    activeSubscriptions,
    hasUnlimitedPlan,
    sections: liveSections,
  };
}

function SectionCard({ section, unlocked, browseHref, themeEditorHref }) {
  const isFree = Number(section.price) === 0 || section.type === "free";

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

          <div
            style={{
              marginTop: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <span
              style={{
                padding: "5px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                background: isFree ? "#ecfdf5" : "#eef2ff",
                color: isFree ? "#047857" : "#4338ca",
              }}
            >
              {isFree ? "Free" : `$${section.price} premium`}
            </span>

            {section.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "5px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  background:
                    tag === "High Converting" || tag === "Trending"
                      ? "#eef2ff"
                      : "#f4f4f5",
                  color:
                    tag === "High Converting" || tag === "Trending"
                      ? "#4338ca"
                      : "#52525b",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
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
          margin: "0 0 14px 0",
          color: "#667085",
          lineHeight: 1.75,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {section.description}
      </p>

      <div
        style={{
          marginBottom: 16,
          color: "#475467",
          fontSize: 13,
          lineHeight: 1.5,
          fontWeight: 700,
        }}
      >
        Works on: {section.placement || "Store pages"}
      </div>

      {unlocked ? (
        <a
          href={themeEditorHref}
          target="_top"
          rel="noreferrer"
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
            textDecoration: "none",
          }}
        >
          Add to theme editor →
        </a>
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

  const unlockedCount = data.sections.filter((section) => {
    const isFree = Number(section.price) === 0 || section.type === "free";
    return isFree || data.hasUnlimitedPlan || data.unlocked.includes(section.handle);
  }).length;

  const paidUnlockedCount = data.sections.filter((section) => {
    const isFree = Number(section.price) === 0 || section.type === "free";
    return !isFree && (data.hasUnlimitedPlan || data.unlocked.includes(section.handle));
  }).length;

  const freeCount = data.sections.filter(
    (section) => Number(section.price) === 0 || section.type === "free",
  ).length;

  const browseHref = `/app${qs}`;

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
        <style>
          {`
            .simpli-additional-summary {
              display: grid;
              grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
              gap: 18px;
              margin-bottom: 22px;
            }

            .simpli-library-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
              gap: 16px;
            }

            @media (max-width: 860px) {
              .simpli-additional-summary {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 560px) {
              .simpli-library-hero-title {
                font-size: 32px !important;
              }
            }
          `}
        </style>

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
            className="simpli-library-hero-title"
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
            View the sections available in your account and quickly add them to
            your Shopify theme editor.
          </p>
        </div>

        <div className="simpli-additional-summary">
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
                  Available
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
                  Free included
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#101828",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {freeCount}
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
                  Premium unlocked
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: data.hasUnlimitedPlan ? "#157347" : "#101828",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {data.hasUnlimitedPlan ? "All" : paidUnlockedCount}
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
                : "Free sections are available automatically. Premium sections can be unlocked individually or through Unlimited Access."}
            </p>

            {!data.hasUnlimitedPlan && (
              <a
                href={`/app/billing${qs}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: 16,
                  padding: "12px 15px",
                  borderRadius: 12,
                  background: "#101828",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                View Unlimited plan →
              </a>
            )}
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

          <div className="simpli-library-grid">
            {data.sections.map((section) => {
              const isFree = Number(section.price) === 0 || section.type === "free";
              const unlocked =
                isFree || data.hasUnlimitedPlan || data.unlocked.includes(section.handle);

              const themeEditorHref = buildThemeEditorUrl({
                shop: data.shop,
                apiKey: data.apiKey,
                blockHandle: section.block,
                template: getTemplateFromPlacement(section.placement),
              });

              return (
                <SectionCard
                  key={section.handle}
                  section={section}
                  unlocked={unlocked}
                  browseHref={browseHref}
                  themeEditorHref={themeEditorHref}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
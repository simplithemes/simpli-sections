import { useMemo, useState } from "react";
import { useLoaderData, useLocation } from "react-router";
import { authenticate } from "../shopify.server";
import { SECTION_CATALOG } from "../data/sections";

const META_NAMESPACE = "simpli_sections";
const META_KEY = "unlocked_sections";

const PURCHASE_NAME_TO_HANDLE = {
  "Simpli Sections — Pro Offer Bar": "pro_offer_bar",
  "Simpli Sections — Trust Badges": "trust_badges",
  "Simpli Sections — Bundle Builder": "bundle_builder",
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Premium", value: "premium" },
  { label: "Bundles", value: "bundles" },
  { label: "Trust", value: "trust" },
  { label: "Product Page", value: "product-page" },
  { label: "Cart", value: "cart" },
  { label: "Upsell", value: "upsell" },
  { label: "New", value: "new" },
  { label: "Trending", value: "trending" },
];

async function getShopAndUnlocked(admin) {
  const query = `#graphql
    query {
      shop {
        id
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
        oneTimePurchases(first: 50, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              status
              createdAt
            }
          }
        }
      }
    }
  `;

  const resp = await admin.graphql(query);
  const json = await resp.json();

  const shop = json?.data?.shop;
  const unlockedValue = shop?.metafield?.value || "";

  const unlocked = unlockedValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const purchases =
    json?.data?.currentAppInstallation?.oneTimePurchases?.edges?.map(
      (e) => e.node,
    ) || [];

  const activeSubscriptions =
    json?.data?.currentAppInstallation?.activeSubscriptions || [];

  return {
    shopId: shop?.id,
    unlocked,
    purchases,
    activeSubscriptions,
  };
}

async function setUnlocked(admin, shopId, unlockedList) {
  const mutation = `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors {
          field
          message
        }
        metafields {
          id
          key
          value
        }
      }
    }
  `;

  const normalizedUnlocked = [...new Set(unlockedList)].sort();

  const resp = await admin.graphql(mutation, {
    variables: {
      metafields: [
        {
          namespace: META_NAMESPACE,
          key: META_KEY,
          type: "single_line_text_field",
          ownerId: shopId,
          value: normalizedUnlocked.join(","),
        },
      ],
    },
  });

  const json = await resp.json();
  const errors = json?.data?.metafieldsSet?.userErrors || [];

  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join(" | "));
  }
}

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);

  const { shopId, unlocked, purchases, activeSubscriptions } =
    await getShopAndUnlocked(admin);

  const hasUnlimitedPlan = activeSubscriptions.some(
    (sub) =>
      sub?.name === "Simpli Sections — Unlimited Access" &&
      sub?.status === "ACTIVE",
  );

  let nextUnlocked = [...unlocked];

  if (hasUnlimitedPlan && !nextUnlocked.includes("__all_access__")) {
    nextUnlocked.push("__all_access__");
  }

  if (!hasUnlimitedPlan && nextUnlocked.includes("__all_access__")) {
    nextUnlocked = nextUnlocked.filter((item) => item !== "__all_access__");
  }

  for (const purchase of purchases) {
    if (purchase?.status !== "ACTIVE") continue;

    const name = purchase?.name || "";
    const handle = PURCHASE_NAME_TO_HANDLE[name];

    if (handle && !nextUnlocked.includes(handle)) {
      nextUnlocked.push(handle);
    }
  }

  nextUnlocked = [...new Set(nextUnlocked)].sort();

  const normalizedUnlocked = [...new Set(unlocked)].sort();

  const changed =
    nextUnlocked.length !== normalizedUnlocked.length ||
    nextUnlocked.some((item, i) => item !== normalizedUnlocked[i]);

  if (changed && shopId) {
    await setUnlocked(admin, shopId, nextUnlocked);
  }

  return {
    status: url.searchParams.get("status") || "",
    section: url.searchParams.get("section") || "",
    unlocked: nextUnlocked,
    activeSubscriptions,
    hasUnlimitedPlan,
    sections: SECTION_CATALOG,
  };
}

function getSectionPrice(section) {
  const numericPrice = Number(section.price || 0);
  return numericPrice;
}

function isSectionFree(section) {
  return getSectionPrice(section) === 0;
}

function getSectionStatus(section) {
  return section.status === "live" ? "Live" : "Coming soon";
}

function getSectionTypeLabel(section) {
  return isSectionFree(section) ? "Free section" : "Premium section";
}

function getSectionButtonLabel({ section, isUnlocked }) {
  if (section.status !== "live") return "Coming soon";
  if (isUnlocked) return "Add to theme";
  if (isSectionFree(section)) return "Add free section";
  return `Unlock now · $${getSectionPrice(section)}`;
}

function getSectionHref({ section, location }) {
  if (section.status !== "live") return "#";

  const qs = location.search || "";
  return `/app/section/${section.handle}${qs}`;
}

function getBuyHref({ section, location }) {
  const params = new URLSearchParams(location.search);
  params.set("section", section.handle);
  return `/app/buy?${params.toString()}`;
}

function AlertBanner({ status, section }) {
  if (!status) return null;

  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";

  if (!isSuccess && !isCancelled) return null;

  return (
    <div
      style={{
        border: isSuccess ? "1px solid #bbf7d0" : "1px solid #fed7aa",
        background: isSuccess ? "#ecfdf5" : "#fff7ed",
        color: isSuccess ? "#166534" : "#9a3412",
        borderRadius: 18,
        padding: "14px 16px",
        marginBottom: 16,
        fontSize: 14,
        fontWeight: 750,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        {isSuccess
          ? `Purchase successful${section ? ` for ${section}` : ""}. Your section is now unlocked.`
          : "Purchase was cancelled. You can unlock the section anytime."}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  location,
  isUnlocked,
  isFromUnlimited,
  hoveredSection,
  setHoveredSection,
}) {
  const isLive = section.status === "live";
  const isFree = isSectionFree(section);
  const price = getSectionPrice(section);
  const isHovered = hoveredSection === section.handle;
  const sectionHref = getSectionHref({ section, location });
  const buyHref = getBuyHref({ section, location });
  const buttonLabel = getSectionButtonLabel({ section, isUnlocked });

  return (
    <div
      onMouseEnter={() => setHoveredSection(section.handle)}
      onMouseLeave={() => setHoveredSection(null)}
      style={{
        height: "100%",
        background: "#ffffff",
        border: isHovered
          ? "1px solid rgba(79,70,229,0.34)"
          : "1px solid rgba(15,23,42,0.08)",
        borderRadius: 20,
        overflow: "hidden",
        opacity: isLive ? 1 : 0.62,
        boxShadow: isHovered
          ? "0 18px 44px rgba(15,23,42,0.13)"
          : "0 8px 24px rgba(15,23,42,0.05)",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        transition:
          "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <a
        href={sectionHref}
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          pointerEvents: isLive ? "auto" : "none",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 118,
            background:
              "linear-gradient(135deg, #eef2ff 0%, #f8fafc 55%, #fff7ed 100%)",
            borderBottom: "1px solid rgba(15,23,42,0.07)",
            padding: 10,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 14,
              background:
                "radial-gradient(circle at 20% 20%, rgba(79,70,229,0.16), transparent 28%), radial-gradient(circle at 80% 30%, rgba(14,165,233,0.18), transparent 30%), linear-gradient(135deg, rgba(15,23,42,0.08), rgba(99,102,241,0.12))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              fontSize: 12,
              fontWeight: 950,
              textAlign: "center",
              padding: 12,
            }}
          >
            {section.title}
          </div>

          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "5px 7px",
                borderRadius: 999,
                background: isFree ? "#ecfdf5" : "#eef2ff",
                color: isFree ? "#047857" : "#4338ca",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {isFree ? "Free" : "Premium"}
            </span>

            {isUnlocked && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "5px 7px",
                  borderRadius: 999,
                  background: "#dcfce7",
                  color: "#166534",
                }}
              >
                Unlocked
              </span>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: 14,
              background: "rgba(15,23,42,0.48)",
              opacity: isHovered && isLive ? 1 : 0,
              transition: "opacity 0.18s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                background: "#ffffff",
                color: "#111827",
                padding: "8px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 950,
              }}
            >
              View details →
            </span>
          </div>
        </div>
      </a>

      <div
        style={{
          padding: 14,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 950,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: isFree ? "#047857" : "#4f46e5",
            }}
          >
            {getSectionTypeLabel(section)}
          </span>

          <span
            style={{
              fontSize: 10,
              fontWeight: 900,
              color: isLive ? "#047857" : "#6b7280",
              background: isLive ? "#ecfdf5" : "#f3f4f6",
              padding: "5px 8px",
              borderRadius: 999,
            }}
          >
            {getSectionStatus(section)}
          </span>
        </div>

        <a
          href={sectionHref}
          style={{
            color: "inherit",
            textDecoration: "none",
            pointerEvents: isLive ? "auto" : "none",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.16,
              letterSpacing: "-0.04em",
              color: "#111827",
            }}
          >
            {section.title}
          </h3>
        </a>

        <p
          style={{
            margin: "7px 0 0",
            color: "#111827",
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 750,
            minHeight: 34,
          }}
        >
          {section.hook || section.description}
        </p>

        <p
          style={{
            margin: "7px 0 0",
            color: "#6b7280",
            fontSize: 12,
            lineHeight: 1.45,
            minHeight: 34,
          }}
        >
          {section.description}
        </p>

        <div
          style={{
            marginTop: 10,
            color: "#4b5563",
            fontSize: 11,
            lineHeight: 1.45,
            fontWeight: 750,
          }}
        >
          Works on: {section.placement || "Store pages"}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 10,
            minHeight: 28,
          }}
        >
          {isFromUnlimited && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "5px 7px",
                borderRadius: 999,
                background: "#eef2ff",
                color: "#4338ca",
              }}
            >
              Included
            </span>
          )}

          {section.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 850,
                padding: "5px 7px",
                borderRadius: 999,
                background:
                  tag === "High Converting" || tag === "Trending"
                    ? "#eef2ff"
                    : "#f3f4f6",
                color:
                  tag === "High Converting" || tag === "Trending"
                    ? "#4338ca"
                    : "#374151",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: "#6b7280",
                fontWeight: 850,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Price
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 950,
                letterSpacing: "-0.055em",
                lineHeight: 1,
                color: "#111827",
              }}
            >
              {isFree ? "Free" : `$${price}`}
            </div>
          </div>

          {isUnlocked ? (
            <a
              href={sectionHref}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                padding: "9px 11px",
                borderRadius: 11,
                fontSize: 11,
                fontWeight: 950,
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              Add to theme
            </a>
          ) : isFree ? (
            <a
              href={sectionHref}
              style={{
                background: "#111827",
                color: "#ffffff",
                padding: "9px 11px",
                borderRadius: 11,
                fontSize: 11,
                fontWeight: 950,
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              {buttonLabel}
            </a>
          ) : (
            <a
              href={buyHref}
              style={{
                background: "#111827",
                color: "#ffffff",
                padding: "9px 11px",
                borderRadius: 11,
                fontSize: 11,
                fontWeight: 950,
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              {buttonLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function UnlimitedPlanCard({ hasUnlimitedPlan, location }) {
  const params = new URLSearchParams(location.search);
  const upgradeHref = `/app/upgrade?${params.toString()}`;

  return (
    <div
      style={{
        position: "sticky",
        top: 18,
        display: "grid",
        gap: 12,
      }}
      className="simpli-sidebar"
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top right, rgba(124,58,237,0.16), transparent 34%), linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 22,
          padding: 18,
          boxShadow: "0 12px 30px rgba(15,23,42,0.07)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "6px 9px",
            borderRadius: 999,
            background: "#ede9fe",
            color: "#6d28d9",
            fontSize: 10,
            fontWeight: 950,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Best value
        </span>

        <h2
          style={{
            margin: 0,
            fontSize: 25,
            lineHeight: 1.04,
            letterSpacing: "-0.055em",
            color: "#111827",
          }}
        >
          Unlimited Access
        </h2>

        <p
          style={{
            margin: "9px 0 0",
            color: "#6b7280",
            lineHeight: 1.55,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Get every premium section now and keep future releases included.
        </p>

        <div
          style={{
            marginTop: 13,
            fontSize: 34,
            fontWeight: 950,
            letterSpacing: "-0.065em",
            color: "#111827",
            lineHeight: 1,
          }}
        >
          $19
          <span
            style={{
              fontSize: 13,
              color: "#6b7280",
              fontWeight: 650,
              letterSpacing: 0,
              marginLeft: 4,
            }}
          >
            /month
          </span>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 8,
            color: "#4b5563",
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 700,
          }}
        >
          <div>✓ Unlock all paid sections</div>
          <div>✓ Future releases included</div>
          <div>✓ Best value after 3 sections</div>
          <div>✓ No coding required</div>
        </div>

        {hasUnlimitedPlan ? (
          <div
            style={{
              display: "block",
              marginTop: 15,
              textAlign: "center",
              background: "#dcfce7",
              color: "#166534",
              padding: "12px 13px",
              borderRadius: 13,
              fontSize: 13,
              fontWeight: 950,
            }}
          >
            ✓ Unlimited Active
          </div>
        ) : (
          <a
            href={upgradeHref}
            style={{
              display: "block",
              marginTop: 15,
              textAlign: "center",
              textDecoration: "none",
              background: "#111827",
              color: "#ffffff",
              padding: "12px 13px",
              borderRadius: 13,
              fontSize: 13,
              fontWeight: 950,
              boxShadow: "0 12px 24px rgba(17,24,39,0.16)",
            }}
          >
            Get Unlimited Access
          </a>
        )}

        {!hasUnlimitedPlan && (
          <div
            style={{
              marginTop: 10,
              textAlign: "center",
              fontSize: 11,
              color: "#6b7280",
              fontWeight: 650,
              lineHeight: 1.45,
            }}
          >
            Best value if you need more than two premium sections.
          </div>
        )}
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 22,
          padding: 18,
          boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 17,
            letterSpacing: "-0.035em",
            color: "#111827",
          }}
        >
          Already unlocked?
        </h3>

        <p
          style={{
            margin: "8px 0 12px",
            color: "#6b7280",
            fontSize: 13,
            lineHeight: 1.55,
            fontWeight: 600,
          }}
        >
          Open your owned sections and add them directly to your Shopify theme.
        </p>

        <a
          href={`/app/additional${location.search || ""}`}
          style={{
            color: "#111827",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          Open Open My Sections →
        </a>
      </div>
    </div>
  );
}

function HowItWorksCard() {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 22,
        padding: 18,
        background: "#ffffff",
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
        className="simpli-steps-grid"
      >
        {[
          {
            title: "Choose section",
            text: "Pick a conversion-focused section from the library.",
          },
          {
            title: "Unlock",
            text: "Buy one section or activate Unlimited Access.",
          },
          {
            title: "Open editor",
            text: "Go to the section detail page and add it to your theme.",
          },
          {
            title: "Customize",
            text: "Edit styles inside Shopify theme editor and publish.",
          },
        ].map((item, index) => (
          <div
            key={item.title}
            style={{
              borderRadius: 16,
              background: "#f9fafb",
              border: "1px solid rgba(15,23,42,0.06)",
              padding: 13,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: "#111827",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 950,
                marginBottom: 8,
              }}
            >
              {index + 1}
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 950,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                lineHeight: 1.45,
                fontWeight: 600,
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  const data = useLoaderData();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredSection, setHoveredSection] = useState(null);

  const liveSections = data.sections.filter(
    (section) => section.status === "live",
  );

  const filteredSections = useMemo(() => {
    return liveSections.filter((section) => {
      const price = getSectionPrice(section);

      if (activeFilter === "all") return true;
      if (activeFilter === "free") return price === 0;
      if (activeFilter === "premium") return price > 0;
      if (activeFilter === "new") return section.tags?.includes("New");
      if (activeFilter === "trending")
        return section.tags?.includes("Trending");

      return section.category === activeFilter;
    });
  }, [activeFilter, liveSections]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <style>
        {`
          .simpli-billing-shell {
            max-width: 1240px;
            margin: 0 auto;
            padding: 18px 20px 40px;
            font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #111827;
          }

          .simpli-billing-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 280px;
            gap: 18px;
            align-items: start;
          }

          .simpli-sections-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .simpli-filter-row::-webkit-scrollbar {
            height: 0;
          }

          @media (max-width: 1120px) {
            .simpli-billing-layout {
              grid-template-columns: 1fr;
            }

            .simpli-sidebar {
              position: static !important;
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 920px) {
            .simpli-sections-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .simpli-steps-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 620px) {
            .simpli-billing-shell {
              padding: 14px 14px 32px;
            }

            .simpli-sections-grid {
              grid-template-columns: 1fr;
            }

            .simpli-sidebar {
              grid-template-columns: 1fr;
            }

            .simpli-hero-title {
              font-size: 30px !important;
            }

            .simpli-hero-stats {
              grid-template-columns: 1fr !important;
            }

            .simpli-steps-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div className="simpli-billing-shell">
        <AlertBanner status={data.status} section={data.section} />

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "radial-gradient(circle at 82% 18%, rgba(168,85,247,0.34), transparent 28%), radial-gradient(circle at 16% 0%, rgba(56,189,248,0.22), transparent 28%), linear-gradient(135deg, #0f172a 0%, #111827 52%, #1e1b4b 100%)",
            borderRadius: 26,
            padding: "26px 28px",
            color: "#ffffff",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 18px 44px rgba(15,23,42,0.16)",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -70,
              top: -90,
              width: 250,
              height: 250,
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: 120,
              bottom: -95,
              width: 220,
              height: 220,
              borderRadius: "999px",
              background: "rgba(99,102,241,0.14)",
              filter: "blur(4px)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.13)",
                fontSize: 10,
                fontWeight: 950,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Simpli Sections Marketplace
            </div>

            <h1
              className="simpli-hero-title"
              style={{
                margin: 0,
                fontSize: 38,
                lineHeight: 1.04,
                letterSpacing: "-0.055em",
                fontWeight: 950,
                maxWidth: 800,
              }}
            >
              Add high-converting Shopify sections without custom coding
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                maxWidth: 760,
                fontSize: 14,
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.76)",
                fontWeight: 600,
              }}
            >
              Buy individual premium sections or unlock the full library with
              Unlimited Access. Sections are built for offers, trust, bundles,
              cart upgrades, product pages, and conversion-focused layouts.
            </p>

            <div
              className="simpli-hero-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 180px))",
                gap: 10,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 13,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 950,
                    letterSpacing: "-0.055em",
                    lineHeight: 1,
                  }}
                >
                  One-click
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 800,
                  }}
                >
                  Add to theme workflow
                </div>
              </div>

              <div
                style={{
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 13,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 950,
                    letterSpacing: "-0.055em",
                    lineHeight: 1,
                  }}
                >
                  $19
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 800,
                  }}
                >
                  Unlimited monthly
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
              <a
                href={`/app/upgrade${location.search || ""}`}
                style={{
                  padding: "11px 15px",
                  borderRadius: 13,
                  background: "#ffffff",
                  color: "#111827",
                  textDecoration: "none",
                  fontWeight: 950,
                  fontSize: 13,
                  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                }}
              >
                Get Unlimited Access
              </a>

              <a
                href={`/app/additional${location.search || ""}`}
                style={{
                  padding: "11px 15px",
                  borderRadius: 13,
                  background: "rgba(255,255,255,0.11)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 850,
                  fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                Open My Sections
              </a>
            </div>
          </div>
        </div>

        <HowItWorksCard />

        <div
          className="simpli-filter-row"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 14,
          }}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                style={{
                  flex: "0 0 auto",
                  border: isActive
                    ? "1px solid #111827"
                    : "1px solid rgba(15,23,42,0.08)",
                  cursor: "pointer",
                  padding: "9px 13px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 900,
                  color: isActive ? "#ffffff" : "#111827",
                  background: isActive ? "#111827" : "#ffffff",
                  boxShadow: isActive
                    ? "0 8px 20px rgba(15,23,42,0.12)"
                    : "none",
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="simpli-billing-layout">
          <div>
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 23,
                    letterSpacing: "-0.045em",
                    lineHeight: 1.15,
                    color: "#111827",
                  }}
                >
                  Browse sections
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#6b7280",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Preview each section, unlock what you need, or get everything
                  with Unlimited.
                </p>
              </div>

            </div>

            {filteredSections.length ? (
              <div className="simpli-sections-grid">
                {filteredSections.map((section) => {
                  const sectionPrice = getSectionPrice(section);
                  const isUnlocked =
                    sectionPrice === 0 ||
                    data.hasUnlimitedPlan ||
                    data.unlocked.includes(section.handle);

                  const isFromUnlimited =
                    data.hasUnlimitedPlan &&
                    sectionPrice > 0 &&
                    !data.unlocked.includes(section.handle);

                  return (
                    <SectionCard
                      key={section.handle}
                      section={section}
                      location={location}
                      isUnlocked={isUnlocked}
                      isFromUnlimited={isFromUnlimited}
                      hoveredSection={hoveredSection}
                      setHoveredSection={setHoveredSection}
                    />
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 22,
                  padding: 24,
                  boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
                  color: "#6b7280",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                No live sections found in this category yet.
              </div>
            )}
          </div>

          <UnlimitedPlanCard
            hasUnlimitedPlan={data.hasUnlimitedPlan}
            location={location}
          />
        </div>

        <div
          style={{
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 22,
            padding: 18,
            background: "#ffffff",
            boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
            marginTop: 18,
          }}
        >
          <div
            style={{
              fontWeight: 950,
              fontSize: 18,
              marginBottom: 8,
              color: "#111827",
              letterSpacing: "-0.035em",
            }}
          >
            Unlocked sections
          </div>

          <div
            style={{
              color: "#6b7280",
              lineHeight: 1.75,
              fontWeight: 650,
              fontSize: 13,
            }}
          >
            {data.hasUnlimitedPlan
              ? "All current premium sections unlocked via unlimited plan."
              : data.unlocked.length
                ? data.unlocked
                    .filter(
                      (item) =>
                        item !== "__all_access__" &&
                        SECTION_CATALOG.some(
                          (section) => section.handle === item,
                        ),
                    )
                    .join(", ")
                : "(none yet)"}
          </div>
        </div>
      </div>
    </>
  );
}
import { useLocation, useOutletContext, useParams } from "react-router";
import { SECTION_CATALOG } from "../data/sections";

const CATEGORY_FALLBACK_WHY = {
  conversion: {
    without: [
      "Important buying messages can get missed",
      "Customers may leave without taking action",
      "Conversion opportunities stay hidden",
    ],
    with: [
      "Key messages become instantly visible",
      "Customers get clearer reasons to buy",
      "Store pages feel more conversion-focused",
    ],
  },
  trust: {
    without: [
      "Customers may hesitate before checkout",
      "Trust signals are not clearly visible",
      "Brand credibility feels weaker",
    ],
    with: [
      "Trust signals are shown clearly",
      "Customers feel safer while buying",
      "Store credibility improves instantly",
    ],
  },
  "product-page": {
    without: [
      "Product benefits may not be clear enough",
      "Customers may still have unanswered doubts",
      "Product pages can feel basic",
    ],
    with: [
      "Product value becomes easier to understand",
      "Customers get answers before checkout",
      "Product pages feel more premium",
    ],
  },
  cart: {
    without: [
      "Cart page misses extra conversion opportunities",
      "Customers may not increase order value",
      "Rewards or offers can go unnoticed",
    ],
    with: [
      "Cart value opportunities become visible",
      "Customers get motivation to add more",
      "Checkout experience feels more guided",
    ],
  },
  bundles: {
    without: [
      "Customers buy single products only",
      "Bundle opportunities are missed",
      "Average order value may stay low",
    ],
    with: [
      "Customers can discover product combinations",
      "Bundle buying feels easier",
      "Average order value can increase",
    ],
  },
};

const DEFAULT_WHY = {
  without: [
    "The store experience can feel basic",
    "Customers may miss important information",
    "Merchants need custom coding for better layouts",
  ],
  with: [
    "The store feels more polished instantly",
    "Customers understand value faster",
    "Merchants can launch without coding",
  ],
};

const DEFAULT_IMPROVEMENTS = [
  "Faster setup",
  "Better store experience",
  "No coding required",
];

function getWhy(section) {
  return section.why || CATEGORY_FALLBACK_WHY[section.category] || DEFAULT_WHY;
}

function getImprovements(section) {
  if (section.improvements?.length) return section.improvements;

  if (section.type === "free") {
    return ["Quick setup", "Cleaner storefront", "Beginner friendly"];
  }

  if (section.category === "bundles" || section.tags?.includes("AOV Boost")) {
    return ["Higher AOV potential", "Better product discovery", "Guided buying"];
  }

  if (section.category === "trust") {
    return ["Stronger trust", "Lower hesitation", "Better buyer confidence"];
  }

  if (section.category === "cart") {
    return ["Cart value growth", "Reward visibility", "Better checkout flow"];
  }

  if (section.tags?.includes("Visual Proof")) {
    return ["Better visual proof", "Higher buyer confidence", "Premium storytelling"];
  }

  return DEFAULT_IMPROVEMENTS;
}

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

export default function SectionDetailPage() {
  const { handle } = useParams();
  const location = useLocation();
  const qs = location.search || "";

  const {
    unlocked = [],
    hasUnlimitedPlan = false,
    apiKey = "",
  } = useOutletContext();

  const searchParams = new URLSearchParams(location.search);
  const shop = searchParams.get("shop") || "";

  const section = SECTION_CATALOG.find((item) => item.handle === handle);

  if (!section) {
    return (
      <div style={{ padding: 32 }}>
        <h1>Feature not found</h1>
        <a href={`/app${qs}`}>Back to features</a>
      </div>
    );
  }

  const isLive = section.status === "live";
  const isFree = section.price === 0;
  const isUnlocked =
    isFree || hasUnlimitedPlan || unlocked.includes(section.handle);
  const sectionImage = section.image || "";
  const why = getWhy(section);
  const improvements = getImprovements(section);

  const buyParams = new URLSearchParams(location.search);
  buyParams.set("section", section.handle);

  const themeEditorHref = buildThemeEditorUrl({
    shop,
    apiKey,
    blockHandle: section.block,
    template: getTemplateFromPlacement(section.placement),
  });

  const primaryHref = isUnlocked
    ? themeEditorHref
    : isLive
      ? `/app/buy?${buyParams.toString()}`
      : "#";

  const primaryLabel = !isLive
    ? "Coming soon"
    : isUnlocked
      ? "Add to theme editor"
      : isFree
        ? "Add free feature"
        : `Unlock this feature for $${section.price}`;

  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "22px 20px 44px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111827",
        background: "#f8fafc",
      }}
    >
      <style>
        {`
          .simpli-detail-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.2fr) 360px;
            gap: 22px;
            align-items: start;
          }

          .simpli-detail-preview {
  max-height: 430px;
}

          @media (max-width: 980px) {
            .simpli-detail-layout {
              grid-template-columns: 1fr;
            }

            .simpli-detail-sidebar {
              position: static !important;
            }
          }

          @media (max-width: 640px) {
            .simpli-detail-preview {
              height: 260px;
            }

            .simpli-detail-title {
              font-size: 28px !important;
              letter-spacing: -0.035em !important;
            }
          }
        `}
      </style>

      <a
        href={`/app${qs}`}
        style={{
          display: "inline-block",
          marginBottom: 16,
          color: "#4b5563",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        ← Back to features
      </a>

      <div className="simpli-detail-layout">
        <div>
          <div
            style={{
              background:
                "linear-gradient(135deg, #eef2ff 0%, #f8fafc 55%, #fff7ed 100%)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 24,
              padding: 14,
              marginBottom: 18,
              boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
            }}
          >
            {sectionImage ? (
  <img
  className="simpli-detail-preview"
  src={sectionImage}
  alt={section.title}
  style={{
    width: "100%",
    height: "auto",
    maxHeight: 430,
    objectFit: "contain",
    display: "block",
  }}
/>
            ) : (
              <div
                className="simpli-detail-preview"
                style={{
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(15,23,42,0.08), rgba(99,102,241,0.14))",
                  fontWeight: 500,
                  color: "#475569",
                  textAlign: "center",
                  padding: 24,
                }}
              >
                {section.title} preview coming soon
              </div>
            )}
          </div>

          {section.whyThisMatters && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 22,
                padding: 22,
                marginBottom: 18,
                boxShadow: "0 8px 22px rgba(15,23,42,0.035)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Why this feature matters
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.75,
                  color: "#374151",
                }}
              >
                {section.whyThisMatters}
              </p>
            </div>
          )}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 22,
              padding: 22,
              marginBottom: 18,
              boxShadow: "0 8px 22px rgba(15,23,42,0.035)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                letterSpacing: "-0.035em",
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              What changes after adding this feature
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 12,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#fff7f7",
                  border: "1px solid #fee2e2",
                  color: "#991b1b",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#991b1b",
                  }}
                >
                  Without this
                </div>

                <div
                  style={{
                    marginTop: 8,
                    lineHeight: 1.7,
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                >
                  {(why.without || DEFAULT_WHY.without).map((item) => (
                    <div key={item}>• {item}</div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#f0fdf4",
                  border: "1px solid #dcfce7",
                  color: "#166534",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#166534",
                  }}
                >
                  With this
                </div>

                <div
                  style={{
                    marginTop: 8,
                    lineHeight: 1.7,
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                >
                  {(why.with || DEFAULT_WHY.with).map((item) => (
                    <div key={item}>• {item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 22,
              padding: 22,
              marginBottom: 18,
              boxShadow: "0 8px 22px rgba(15,23,42,0.035)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                letterSpacing: "-0.035em",
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              Where merchants use this feature
            </h2>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 14,
              }}
            >
              {(section.useCases || []).map((useCase) => (
                <div
                  key={useCase}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#f9fafb",
                    border: "1px solid rgba(15,23,42,0.06)",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#374151",
                    lineHeight: 1.5,
                  }}
                >
                  ✓ {useCase}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 22,
              padding: 22,
              boxShadow: "0 8px 22px rgba(15,23,42,0.035)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                letterSpacing: "-0.035em",
                fontWeight: 600,
                lineHeight: 1.15,
              }}
            >
              What this helps improve
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginTop: 14,
              }}
            >
              {improvements.map((item) => (
                <div
                  key={item}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#f9fafb",
                    border: "1px solid rgba(15,23,42,0.06)",
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.45,
                    color: "#374151",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="simpli-detail-sidebar"
          style={{
            position: "sticky",
            top: 18,
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 12px 34px rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 9px",
                borderRadius: 999,
                background: isFree ? "#ecfdf5" : "#eef2ff",
                color: isFree ? "#047857" : "#4338ca",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {isFree ? "Free" : "Premium"}
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 9px",
                borderRadius: 999,
                background: isLive ? "#ecfdf5" : "#f3f4f6",
                color: isLive ? "#047857" : "#6b7280",
              }}
            >
              {isLive ? "Live" : "Coming soon"}
            </span>

            {isUnlocked && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "6px 9px",
                  borderRadius: 999,
                  background: "#dcfce7",
                  color: "#166534",
                }}
              >
                Already unlocked
              </span>
            )}
          </div>

          <h1
            className="simpli-detail-title"
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              fontWeight: 600,
            }}
          >
            {section.title}
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 15,
              lineHeight: 1.65,
              color: "#374151",
              fontWeight: 400,
            }}
          >
            {section.hook || section.description}
          </p>

          <p
            style={{
              margin: "10px 0 0",
              color: "#6b7280",
              fontSize: 14,
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            {section.description}
          </p>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 16,
              background: "#f9fafb",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Works on
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#111827",
                lineHeight: 1.45,
              }}
            >
              {section.placement || "Store pages"}
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 16,
              background: "#f9fafb",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              Theme block
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#111827",
                wordBreak: "break-word",
                lineHeight: 1.45,
              }}
            >
              {section.block}.liquid
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginTop: 14,
            }}
          >
            {section.tags?.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "6px 8px",
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

          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "end",
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 38,
                fontWeight: 600,
                letterSpacing: "-0.045em",
                lineHeight: 1,
              }}
            >
              {isFree ? "Free" : `$${section.price}`}
            </span>

            {!isFree && (
              <span
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  marginBottom: 4,
                  fontWeight: 400,
                }}
              >
                one-time
              </span>
            )}
          </div>

          <a
            href={primaryHref}
            target={isUnlocked ? "_top" : undefined}
            rel={isUnlocked ? "noreferrer" : undefined}
            style={{
              display: "block",
              marginTop: 18,
              textAlign: "center",
              textDecoration: "none",
              background: isLive
                ? isUnlocked
                  ? "#16a34a"
                  : "#111827"
                : "#e5e7eb",
              color: isLive ? "#ffffff" : "#6b7280",
              padding: "13px 14px",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              pointerEvents: isLive ? "auto" : "none",
            }}
          >
            {primaryLabel}
          </a>

          <div
            style={{
              marginTop: 10,
              color: "#6b7280",
              fontSize: 12,
              lineHeight: 1.5,
              textAlign: "center",
              fontWeight: 400,
            }}
          >
            No coding required • Opens directly inside Shopify theme editor
          </div>

          {!isFree && !isUnlocked && (
            <a
              href={`/app/billing${qs}`}
              style={{
                display: "block",
                marginTop: 12,
                textAlign: "center",
                textDecoration: "none",
                color: "#111827",
                padding: "12px 14px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid rgba(15,23,42,0.1)",
                background: "#ffffff",
              }}
            >
              Or get Unlimited for $19/month
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
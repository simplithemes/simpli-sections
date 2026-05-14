import { useMemo, useState } from "react";
import { useLocation, useOutletContext } from "react-router";
import { SECTION_CATALOG, SECTION_CATEGORIES } from "../data/sections";

export default function AppHome() {
  const location = useLocation();
  const qs = location.search || "";
  const { unlocked = [], hasUnlimitedPlan = false } = useOutletContext();
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredSection, setHoveredSection] = useState(null);

  const totalSections = SECTION_CATALOG.length;
  const freeSections = SECTION_CATALOG.filter((section) => section.price === 0).length;
  const premiumSections = SECTION_CATALOG.filter((section) => section.price > 0).length;

  const filteredSections = useMemo(() => {
    return SECTION_CATALOG.filter((section) => {
      if (activeCategory === "all") return true;
      if (activeCategory === "free") return section.price === 0;
      if (activeCategory === "new") return section.tags?.includes("New");
      if (activeCategory === "trending") return section.tags?.includes("Trending");
      return section.category === activeCategory;
    });
  }, [activeCategory]);

  const activeCategoryLabel =
    SECTION_CATEGORIES.find((category) => category.value === activeCategory)?.label || "All";

  const getButtonLabel = (section) => {
    if (section.status !== "live") return "Coming soon";

    const isUnlocked = hasUnlimitedPlan || unlocked.includes(section.handle);

    if (isUnlocked) return "Add to theme";
    if (section.price === 0) return "Add free";

    return "Upgrade to unlock";
  };

  const getSectionUrl = (section) => {
    if (section.status !== "live") return "#";
    return `/app/section/${section.handle}${qs}`;
  };

  const getPreviewImage = (section) => {
    return section.image || "";
  };

  return (
    <div
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "18px 20px 40px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111827",
        background: "#f8fafc",
      }}
    >
      <style>
        {`
          .simpli-market-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 260px;
            gap: 18px;
            align-items: start;
          }

          .simpli-section-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .simpli-category-row::-webkit-scrollbar {
            display: none;
          }

          .simpli-category-row {
            scrollbar-width: none;
          }

          .simpli-section-card-preview {
            transition: transform 0.25s ease;
          }

          .simpli-section-card:hover .simpli-section-card-preview {
            transform: scale(1.025);
          }

          @media (max-width: 1080px) {
            .simpli-market-layout {
              grid-template-columns: 1fr;
            }

            .simpli-market-sidebar {
              position: static !important;
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 860px) {
            .simpli-section-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 560px) {
            .simpli-section-grid {
              grid-template-columns: 1fr;
            }

            .simpli-market-sidebar {
              grid-template-columns: 1fr;
            }

            .simpli-hero-title {
              font-size: 28px !important;
              letter-spacing: -0.035em !important;
            }

            .simpli-hero-stats {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 82% 18%, rgba(168,85,247,0.28), transparent 28%), radial-gradient(circle at 16% 0%, rgba(56,189,248,0.18), transparent 28%), linear-gradient(135deg, #0f172a 0%, #111827 52%, #1e1b4b 100%)",
          borderRadius: 24,
          padding: "26px 28px",
          color: "#ffffff",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 18px 44px rgba(15,23,42,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -70,
            top: -90,
            width: 240,
            height: 240,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -90,
            bottom: -120,
            width: 280,
            height: 280,
            borderRadius: "999px",
            background: "rgba(99,102,241,0.16)",
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
              fontWeight: 650,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Simpli Features Marketplace
          </div>

          <h1
            className="simpli-hero-title"
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              fontWeight: 650,
              maxWidth: 780,
            }}
          >
            Add conversion-focused features to your Shopify store in minutes
          </h1>

          <p
            style={{
              margin: "11px 0 0",
              maxWidth: 720,
              fontSize: 14,
              lineHeight: 1.7,
              fontWeight: 400,
              color: "rgba(255,255,255,0.76)",
            }}
          >
            Explore premium Shopify features for bundles, trust, upsells,
            product pages, video proof, delivery checks, and revenue-focused
            store experiences.
          </p>

          <div
            className="simpli-hero-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              maxWidth: 520,
              marginTop: 16,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 650, lineHeight: 1 }}>
                {totalSections}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Live features
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 650, lineHeight: 1 }}>
                {freeSections}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Free features
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 650, lineHeight: 1 }}>
                {premiumSections}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Premium features
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <a
              href={`/app/billing${qs}`}
              style={{
                padding: "11px 15px",
                borderRadius: 12,
                background: "#ffffff",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
              }}
            >
              Explore all features
            </a>

            <a
              href={`/app/additional${qs}`}
              style={{
                padding: "11px 15px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.11)",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 13,
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              My Features
            </a>
          </div>
        </div>
      </div>

      <div
        className="simpli-category-row"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 14,
        }}
      >
        {SECTION_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => setActiveCategory(category.value)}
              style={{
                flex: "0 0 auto",
                border: isActive
                  ? "1px solid #111827"
                  : "1px solid rgba(15,23,42,0.08)",
                cursor: "pointer",
                padding: "9px 13px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                color: isActive ? "#ffffff" : "#374151",
                background: isActive ? "#111827" : "#ffffff",
                boxShadow: isActive ? "0 8px 20px rgba(15,23,42,0.12)" : "none",
              }}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="simpli-market-layout">
        <div>
          <div style={{ marginBottom: 12 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
                fontWeight: 600,
              }}
            >
              {activeCategory === "all"
                ? "Explore features"
                : `${activeCategoryLabel} features`}
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#6b7280",
                fontSize: 13,
                lineHeight: 1.55,
                fontWeight: 400,
              }}
            >
              Preview each feature, understand the use case, and unlock what
              your store needs next.
            </p>
          </div>

          <div className="simpli-section-grid">
            {filteredSections.map((section) => {
              const isLive = section.status === "live";
              const isFree = section.price === 0;
              const sectionImage = getPreviewImage(section);
              const isHovered = hoveredSection === section.handle;
              const isUnlocked = hasUnlimitedPlan || unlocked.includes(section.handle);
              const isFromUnlimited = hasUnlimitedPlan && !unlocked.includes(section.handle);

              return (
                <a
                  key={section.handle}
                  href={getSectionUrl(section)}
                  onMouseEnter={() => setHoveredSection(section.handle)}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    pointerEvents: isLive ? "auto" : "none",
                  }}
                >
                  <div
                    className="simpli-section-card"
                    style={{
                      background: "#ffffff",
                      border: isHovered
                        ? "1px solid rgba(79,70,229,0.32)"
                        : "1px solid rgba(15,23,42,0.08)",
                      borderRadius: 18,
                      overflow: "hidden",
                      opacity: isLive ? 1 : 0.66,
                      boxShadow: isHovered
                        ? "0 18px 42px rgba(15,23,42,0.11)"
                        : "0 8px 22px rgba(15,23,42,0.04)",
                      transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                      transition:
                        "transform 0.18s ease, box-shadow 0.18s ease, border 0.18s ease",
                      cursor: isLive ? "pointer" : "default",
                      minHeight: "100%",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: 112,
                        background:
                          "linear-gradient(135deg, #eef2ff 0%, #f8fafc 55%, #fff7ed 100%)",
                        borderBottom: "1px solid rgba(15,23,42,0.07)",
                        padding: 9,
                      }}
                    >
                      {sectionImage ? (
                        <img
                          className="simpli-section-card-preview"
                          src={sectionImage}
                          alt={section.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 12,
                            background:
                              "linear-gradient(135deg, rgba(15,23,42,0.08), rgba(99,102,241,0.14))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#475569",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          Preview coming soon
                        </div>
                      )}

                      <div
                        style={{
                          position: "absolute",
                          inset: 9,
                          borderRadius: 12,
                          background: "rgba(15,23,42,0.46)",
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
                            padding: "7px 11px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Preview →
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: 13 }}>
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
                            fontWeight: 650,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: isFree ? "#047857" : "#4f46e5",
                          }}
                        >
                          {isFree ? "Free feature" : "Premium feature"}
                        </span>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isLive ? "#047857" : "#6b7280",
                            background: isLive ? "#ecfdf5" : "#f3f4f6",
                            padding: "4px 7px",
                            borderRadius: 999,
                          }}
                        >
                          {isLive ? "Live" : "Soon"}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: 17,
                          lineHeight: 1.18,
                          letterSpacing: "-0.025em",
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {section.title}
                      </h3>

                      <p
                        style={{
                          margin: "7px 0 0",
                          color: "#374151",
                          fontSize: 12,
                          lineHeight: 1.5,
                          fontWeight: 400,
                          minHeight: 36,
                        }}
                      >
                        {section.hook || section.description}
                      </p>

                      <div
                        style={{
                          marginTop: 10,
                          color: "#6b7280",
                          fontSize: 11,
                          lineHeight: 1.45,
                          fontWeight: 400,
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
                          minHeight: 26,
                        }}
                      >
                        {isUnlocked && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "5px 7px",
                              borderRadius: 999,
                              background: "#dcfce7",
                              color: "#166534",
                            }}
                          >
                            Unlocked
                          </span>
                        )}

                        {isFromUnlimited && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
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
                              fontWeight: 500,
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

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          marginTop: 13,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#6b7280",
                              fontWeight: 500,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Access
                          </div>

                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 650,
                              letterSpacing: "-0.035em",
                              lineHeight: 1,
                            }}
                          >
                            {isFree ? "Free" : "Unlimited"}
                          </div>
                        </div>

                        <span
                          style={{
                            background: isLive ? "#111827" : "#e5e7eb",
                            color: isLive ? "#ffffff" : "#6b7280",
                            padding: "8px 10px",
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getButtonLabel(section)}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div
          className="simpli-market-sidebar"
          style={{
            position: "sticky",
            top: 18,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 20,
              padding: 17,
              boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "5px 8px",
                borderRadius: 999,
                background: "#ede9fe",
                color: "#6d28d9",
                fontSize: 10,
                fontWeight: 650,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Best value
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: 22,
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                fontWeight: 600,
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
                fontWeight: 400,
              }}
            >
              {hasUnlimitedPlan
                ? "Your Unlimited Access plan is active. All premium features are unlocked."
                : "Unlock every current and future premium feature in one plan."}
            </p>

            <div
              style={{
                marginTop: 12,
                fontSize: 28,
                fontWeight: 650,
                letterSpacing: "-0.045em",
              }}
            >
              $19
              <span
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  fontWeight: 400,
                  letterSpacing: 0,
                }}
              >
                /month
              </span>
            </div>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gap: 7,
                color: "#4b5563",
                fontSize: 12,
                lineHeight: 1.45,
                fontWeight: 400,
              }}
            >
              <div>✓ Unlock all paid features</div>
              <div>✓ Future releases included</div>
              <div>✓ One plan for every premium feature</div>
            </div>

            {hasUnlimitedPlan ? (
              <div
                style={{
                  display: "block",
                  marginTop: 14,
                  textAlign: "center",
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "11px 13px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ✓ Unlimited Active
              </div>
            ) : (
              <a
                href={`/app/upgrade${qs}`}
                style={{
                  display: "block",
                  marginTop: 14,
                  textAlign: "center",
                  textDecoration: "none",
                  background: "#111827",
                  color: "#ffffff",
                  padding: "11px 13px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Get Unlimited
              </a>
            )}
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 20,
              padding: 17,
              boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                letterSpacing: "-0.025em",
                fontWeight: 600,
              }}
            >
              My Features
            </h3>

            <p
              style={{
                margin: "8px 0 12px",
                color: "#6b7280",
                fontSize: 13,
                lineHeight: 1.55,
                fontWeight: 400,
              }}
            >
              View unlocked features and add them to your Shopify theme.
            </p>

            <a
              href={`/app/additional${qs}`}
              style={{
                color: "#111827",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Open library →
            </a>
          </div>

          <div
            style={{
              background: "#111827",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 20,
              padding: 17,
              boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
              color: "#ffffff",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                letterSpacing: "-0.025em",
                fontWeight: 600,
              }}
            >
              Launch collection
            </h3>

            <p
              style={{
                margin: "8px 0 0",
                color: "rgba(255,255,255,0.72)",
                fontSize: 13,
                lineHeight: 1.55,
                fontWeight: 400,
              }}
            >
              {totalSections} curated features built for conversion, trust,
              product pages, bundles, and cart growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";
import { useLocation, useOutletContext } from "react-router";
import {
  BUSINESS_CATEGORIES,
  HOMEPAGE_PACKS,
  SECTION_CATALOG,
  SECTION_TYPES,
} from "../data/sections";

const toneStyles = {
  slate: ["#0f172a", "#334155", "#e2e8f0"],
  rose: ["#881337", "#be123c", "#ffe4e6"],
  emerald: ["#064e3b", "#059669", "#d1fae5"],
  amber: ["#78350f", "#d97706", "#fef3c7"],
  violet: ["#3b0764", "#7c3aed", "#ede9fe"],
};

const appFont =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const businessLabelByValue = Object.fromEntries(
  BUSINESS_CATEGORIES.map((item) => [item.value, item.label]),
);

function getIsFree(section) {
  return Number(section.price || 0) === 0 || section.type === "free";
}

function getIsUnlocked(section, unlocked, hasUnlimitedPlan) {
  return getIsFree(section) || hasUnlimitedPlan || unlocked.includes(section.handle);
}

function buildThemeEditorUrl({ shop, apiKey, blockHandle, template = "index" }) {
  const params = new URLSearchParams();
  params.set("template", template);
  params.set("target", "mainSection");
  params.set("addAppBlockId", `${apiKey}/${blockHandle}`);

  if (shop) return `https://${shop}/admin/themes/current/editor?${params.toString()}`;
  return `/admin/themes/current/editor?${params.toString()}`;
}

function PreviewArtwork({ section, compact = false }) {
  const [dark, mid, light] = toneStyles[section.previewTone] || toneStyles.slate;
  const chips = section.sectionType === "homepage-hero" ? 1 : 3;

  return (
    <div
      style={{
        position: "relative",
        height: compact ? 118 : 280,
        borderRadius: compact ? 14 : 22,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${dark} 0%, ${mid} 58%, ${light} 100%)`,
        border: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: compact ? 12 : 22,
          display: "grid",
          gridTemplateColumns: section.sectionType === "homepage-hero" ? "1.1fr .9fr" : "1fr",
          gap: compact ? 8 : 18,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              width: compact ? 74 : 138,
              height: compact ? 8 : 12,
              borderRadius: 999,
              background: "rgba(255,255,255,0.72)",
              marginBottom: compact ? 8 : 16,
            }}
          />
          <div
            style={{
              width: compact ? "78%" : "70%",
              height: compact ? 16 : 34,
              borderRadius: 8,
              background: "#ffffff",
              marginBottom: compact ? 7 : 12,
            }}
          />
          <div
            style={{
              width: compact ? "58%" : "48%",
              height: compact ? 9 : 14,
              borderRadius: 999,
              background: "rgba(255,255,255,0.72)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              section.sectionType === "featured-collection" || section.sectionType === "category-grid"
                ? "repeat(3, 1fr)"
                : "1fr",
            gap: compact ? 6 : 10,
          }}
        >
          {Array.from({ length: chips }).map((_, index) => (
            <div
              key={index}
              style={{
                aspectRatio: section.sectionType === "offer-banner" ? "4 / 1" : "1 / 1",
                minHeight: compact ? 34 : 72,
                borderRadius: compact ? 10 : 16,
                background: "rgba(255,255,255,0.88)",
                boxShadow: "0 18px 34px rgba(15,23,42,0.16)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ section, isUnlocked, isInstalled }) {
  let label = "Locked";
  let background = "#fff7ed";
  let color = "#9a3412";

  if (isInstalled) {
    label = "Installed";
    background = "#dcfce7";
    color = "#166534";
  } else if (isUnlocked) {
    label = "Not installed";
    background = "#eef2ff";
    color = "#3730a3";
  } else if (getIsFree(section)) {
    label = "Free";
    background = "#ecfdf5";
    color = "#047857";
  }

  return (
    <span
      style={{
        padding: "6px 8px",
        borderRadius: 999,
        background,
        color,
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function SectionCard({ section, isUnlocked, isInstalled, onPreview, installHref, upgradeHref }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 18,
        padding: 12,
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      <PreviewArtwork section={section} compact />

      <div style={{ padding: "12px 2px 0", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {section.sectionTypeLabel} / {section.designName}
            </div>
            <h3 style={{ margin: "6px 0 0", fontSize: 17, lineHeight: 1.2, color: "#111827" }}>
              {section.title}
            </h3>
          </div>
          <StatusPill section={section} isUnlocked={isUnlocked} isInstalled={isInstalled} />
        </div>

        <p style={{ margin: "8px 0 0", color: "#4b5563", fontSize: 13, lineHeight: 1.55 }}>
          {section.description}
        </p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {section.businessCategories.slice(0, 3).map((category) => (
            <span
              key={category}
              style={{
                padding: "5px 7px",
                borderRadius: 999,
                background: "#f3f4f6",
                color: "#374151",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {businessLabelByValue[category] || category}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
          <button
            type="button"
            onClick={() => onPreview(section)}
            style={{
              border: "1px solid rgba(15,23,42,0.12)",
              background: "#ffffff",
              color: "#111827",
              borderRadius: 11,
              padding: "10px 11px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Preview
          </button>

          {isUnlocked ? (
            <a
              href={installHref}
              target="_top"
              rel="noreferrer"
              style={{
                textAlign: "center",
                textDecoration: "none",
                background: "#111827",
                color: "#ffffff",
                borderRadius: 11,
                padding: "10px 11px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Install Section
            </a>
          ) : (
            <a
              href={upgradeHref}
              style={{
                textAlign: "center",
                textDecoration: "none",
                background: "#111827",
                color: "#ffffff",
                borderRadius: 11,
                padding: "10px 11px",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Unlock
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ section, onClose, isUnlocked, installHref, upgradeHref }) {
  if (!section) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(15,23,42,0.58)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        fontFamily: appFont,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(980px, 100%)",
          maxHeight: "92vh",
          overflow: "auto",
          background: "#ffffff",
          borderRadius: 22,
          boxShadow: "0 28px 80px rgba(15,23,42,0.28)",
          color: "#111827",
          fontFamily: appFont,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: 18, borderBottom: "1px solid rgba(15,23,42,0.08)", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
              {section.sectionTypeLabel} / {section.designName}
            </div>
            <h2 style={{ margin: "4px 0 0", fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.02em" }}>{section.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.1)",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        <div style={{ padding: 18, display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) 320px", gap: 18 }} className="simpli-modal-grid">
          <div>
            <PreviewArtwork section={section} />
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <InfoBlock title="Recommended use case" text={section.recommendedUseCase || section.useCases?.[0]} />
              <InfoBlock title="Why this works" text={section.whyThisMatters} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <InfoList title="Supported categories" items={section.businessCategories.map((item) => businessLabelByValue[item] || item)} />
            <InfoList title="Customization options" items={section.customizationOptions || []} />

            <div style={{ padding: 15, borderRadius: 16, background: "#f9fafb", border: "1px solid rgba(15,23,42,0.08)" }}>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800, marginBottom: 6 }}>Access</div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.02em" }}>{getIsFree(section) ? "Free" : "Unlimited Access"}</div>
              <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>
                {isUnlocked
                  ? "This section is available for your store. Install it into the Shopify theme editor and customize it there."
                  : "Upgrade to unlock this premium section and all current homepage builder sections."}
              </p>

              {isUnlocked ? (
                <a
                  href={installHref}
                  target="_top"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#111827",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 850,
                  }}
                >
                  Add to Theme
                </a>
              ) : (
                <a
                  href={upgradeHref}
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: 14,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "#111827",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 850,
                  }}
                >
                  Unlock Section
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, text }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: "#374151", fontWeight: 500 }}>{text}</div>
    </div>
  );
}

function InfoList({ title, items }) {
  return (
    <div style={{ padding: 15, borderRadius: 16, background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800, marginBottom: 9 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {items.map((item) => (
          <span key={item} style={{ padding: "6px 8px", borderRadius: 999, background: "#f3f4f6", fontSize: 12, color: "#374151", fontWeight: 700 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PackCard({ pack, sectionsByHandle }) {
  return (
    <div
      style={{
        minWidth: 336,
        borderRadius: 18,
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        padding: 12,
        boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 10",
          borderRadius: 14,
          overflow: "hidden",
          background: "#f3f4f6",
          border: "1px solid rgba(15,23,42,0.08)",
          marginBottom: 13,
        }}
      >
        <img
          src={pack.image}
          alt={`${pack.title} preview`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div style={{ padding: "0 4px 4px" }}>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Homepage pack
        </div>
        <h3 style={{ margin: "6px 0 0", fontSize: 18, lineHeight: 1.2 }}>{pack.title}</h3>
        <p style={{ margin: "8px 0 12px", color: "#4b5563", fontSize: 13, lineHeight: 1.55 }}>{pack.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {pack.bestFor.map((tag) => (
            <span key={tag} style={{ padding: "5px 7px", borderRadius: 999, background: "#eef2ff", color: "#3730a3", fontSize: 10, fontWeight: 800 }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {pack.sections.slice(0, 8).map((handle) => {
            const section = sectionsByHandle.get(handle);
            return (
              <div key={handle} style={{ display: "flex", justifyContent: "space-between", gap: 8, color: "#374151", fontSize: 12 }}>
                <span>{section?.sectionTypeLabel || "Section"}</span>
                <strong style={{ color: "#111827" }}>{section?.title || handle}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AppHome() {
  const location = useLocation();
  const qs = location.search || "";
  const { unlocked = [], hasUnlimitedPlan = false, apiKey = "" } = useOutletContext();
  const [activeType, setActiveType] = useState("all");
  const [activeBusiness, setActiveBusiness] = useState("all");
  const [query, setQuery] = useState("");
  const [previewSection, setPreviewSection] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const shop = searchParams.get("shop") || "";

  const sectionsByHandle = useMemo(
    () => new Map(SECTION_CATALOG.map((section) => [section.handle, section])),
    [],
  );

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return SECTION_CATALOG.filter((section) => {
      if (activeType !== "all" && section.sectionType !== activeType) return false;
      if (activeBusiness !== "all" && !section.businessCategories.includes(activeBusiness)) return false;

      if (!normalizedQuery) return true;

      return [
        section.title,
        section.description,
        section.sectionTypeLabel,
        ...(section.tags || []),
        ...(section.businessCategories || []).map((item) => businessLabelByValue[item] || item),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeBusiness, activeType, query]);

  const freeCount = SECTION_CATALOG.filter(getIsFree).length;
  const unlockedCount = SECTION_CATALOG.filter((section) =>
    getIsUnlocked(section, unlocked, hasUnlimitedPlan),
  ).length;

  const selectedInstallHref = previewSection
    ? buildThemeEditorUrl({
        shop,
        apiKey,
        blockHandle: previewSection.block,
        template: previewSection.template,
      })
    : "#";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      <style>
        {`
          .simpli-builder-shell {
            max-width: 1380px;
            margin: 0 auto;
            padding: 18px 20px 44px;
            font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #111827;
          }
          .simpli-builder-shell button,
          .simpli-builder-shell input,
          .simpli-builder-shell a {
            font-family: ${appFont};
          }
          .simpli-builder-layout {
            display: grid;
            grid-template-columns: 240px minmax(0, 1fr);
            gap: 18px;
            align-items: start;
          }
          .simpli-section-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }
          .simpli-scroll-row {
            display: flex;
            gap: 12px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
          }
          .simpli-scroll-row::-webkit-scrollbar {
            display: none;
          }
          @media (max-width: 1120px) {
            .simpli-builder-layout { grid-template-columns: 1fr; }
            .simpli-type-sidebar { position: static !important; display: flex; overflow-x: auto; }
            .simpli-type-sidebar button { white-space: nowrap; }
            .simpli-section-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
          @media (max-width: 760px) {
            .simpli-builder-shell { padding: 14px; }
            .simpli-hero-grid { grid-template-columns: 1fr !important; }
            .simpli-section-grid { grid-template-columns: 1fr; }
            .simpli-modal-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      <div className="simpli-builder-shell">
        <div
          className="simpli-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) 360px",
            gap: 16,
            alignItems: "stretch",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 24,
              padding: 28,
              color: "#ffffff",
              background:
                "linear-gradient(135deg, #111827 0%, #1f2937 48%, #14532d 100%)",
              boxShadow: "0 18px 44px rgba(15,23,42,0.16)",
            }}
          >
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.78 }}>
                Simpli Sections Website Builder
              </div>
              <h1 style={{ margin: "10px 0 0", fontSize: 40, lineHeight: 1.04, letterSpacing: "-0.04em", maxWidth: 760 }}>
                Build your complete Shopify homepage in minutes
              </h1>
              <p style={{ margin: "12px 0 0", maxWidth: 760, color: "rgba(255,255,255,0.76)", lineHeight: 1.7, fontSize: 14 }}>
                Choose premium, mobile-first sections category-wise, filter by D2C business type, preview the design, and install directly into the Shopify theme editor.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                <a href={`/app/upgrade${qs}`} style={{ padding: "12px 15px", borderRadius: 12, background: "#ffffff", color: "#111827", textDecoration: "none", fontWeight: 850 }}>
                  Get Unlimited Access
                </a>
                <a href={`/app/additional${qs}`} style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(255,255,255,0.12)", color: "#ffffff", textDecoration: "none", fontWeight: 800, border: "1px solid rgba(255,255,255,0.16)" }}>
                  My Sections
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["Section designs", SECTION_CATALOG.length],
              ["Homepage packs", HOMEPAGE_PACKS.length],
              ["Free starter sections", freeCount],
              [hasUnlimitedPlan ? "Plan status" : "Unlocked sections", hasUnlimitedPlan ? "All access" : unlockedCount],
            ].map(([label, value]) => (
              <div key={label} style={{ borderRadius: 18, padding: 16, background: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 8px 24px rgba(15,23,42,0.04)" }}>
                <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 800 }}>{label}</div>
                <div style={{ marginTop: 4, fontSize: 24, lineHeight: 1, fontWeight: 900 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "end", marginBottom: 10, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Ready-made homepage packs</h2>
              <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: 13 }}>
                Use these packs as the recommended section order for a complete D2C homepage.
              </p>
            </div>
          </div>
          <div className="simpli-scroll-row">
            {HOMEPAGE_PACKS.map((pack) => (
              <PackCard key={pack.handle} pack={pack} sectionsByHandle={sectionsByHandle} />
            ))}
          </div>
        </div>

        <div className="simpli-builder-layout">
          <div
            className="simpli-type-sidebar"
            style={{
              position: "sticky",
              top: 18,
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 18,
              padding: 10,
              boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            }}
          >
            {SECTION_TYPES.map((type) => {
              const isActive = activeType === type.value;
              const count =
                type.value === "all"
                  ? SECTION_CATALOG.length
                  : SECTION_CATALOG.filter((section) => section.sectionType === type.value).length;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setActiveType(type.value)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 11px",
                    background: isActive ? "#111827" : "transparent",
                    color: isActive ? "#ffffff" : "#374151",
                    cursor: "pointer",
                    fontWeight: 800,
                    textAlign: "left",
                  }}
                >
                  <span>{type.label}</span>
                  <span style={{ opacity: 0.7 }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(240px, 1fr) auto",
                gap: 10,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sections, designs, use cases..."
                style={{
                  width: "100%",
                  border: "1px solid rgba(15,23,42,0.12)",
                  borderRadius: 14,
                  padding: "13px 14px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 800 }}>
                {filteredSections.length} designs
              </div>
            </div>

            <div className="simpli-scroll-row" style={{ marginBottom: 14 }}>
              {BUSINESS_CATEGORIES.map((business) => {
                const isActive = activeBusiness === business.value;
                return (
                  <button
                    key={business.value}
                    type="button"
                    onClick={() => setActiveBusiness(business.value)}
                    style={{
                      flex: "0 0 auto",
                      border: isActive ? "1px solid #111827" : "1px solid rgba(15,23,42,0.08)",
                      background: isActive ? "#111827" : "#ffffff",
                      color: isActive ? "#ffffff" : "#374151",
                      borderRadius: 999,
                      padding: "9px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {business.label}
                  </button>
                );
              })}
            </div>

            <div className="simpli-section-grid">
              {filteredSections.map((section) => {
                const isUnlocked = getIsUnlocked(section, unlocked, hasUnlimitedPlan);
                const isInstalled = unlocked.includes(section.handle) || (hasUnlimitedPlan && !getIsFree(section));
                const installHref = buildThemeEditorUrl({
                  shop,
                  apiKey,
                  blockHandle: section.block,
                  template: section.template,
                });
                const upgradeParams = new URLSearchParams(location.search);
                upgradeParams.set("section", section.handle);

                return (
                  <SectionCard
                    key={section.handle}
                    section={section}
                    isUnlocked={isUnlocked}
                    isInstalled={isInstalled}
                    onPreview={setPreviewSection}
                    installHref={installHref}
                    upgradeHref={`/app/upgrade?${upgradeParams.toString()}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <PreviewModal
        section={previewSection}
        onClose={() => setPreviewSection(null)}
        isUnlocked={previewSection ? getIsUnlocked(previewSection, unlocked, hasUnlimitedPlan) : false}
        installHref={selectedInstallHref}
        upgradeHref={previewSection ? `/app/upgrade?${new URLSearchParams({ ...Object.fromEntries(searchParams), section: previewSection.handle }).toString()}` : `/app/upgrade${qs}`}
      />
    </>
  );
}

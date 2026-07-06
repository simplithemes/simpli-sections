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

function PreviewShell({ section, compact, children }) {
  const [dark, mid, light] = toneStyles[section.previewTone] || toneStyles.slate;

  return (
    <div
      style={{
        position: "relative",
        height: compact ? 118 : 280,
        borderRadius: compact ? 14 : 22,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${dark} 0%, ${mid} 58%, ${light} 100%)`,
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: compact ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: compact ? 10 : 18,
          display: "grid",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MiniText({ width = "70%", height = 10, light = false }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 999,
        background: light ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.16)",
      }}
    />
  );
}

function PreviewLabel({ children, compact, muted = false, inverse = false }) {
  return (
    <div
      style={{
        color: inverse ? "#ffffff" : muted ? "#64748b" : "#111827",
        fontSize: compact ? 8 : 12,
        fontWeight: muted ? 700 : 900,
        lineHeight: 1.15,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  );
}

function PreviewHeading({ children, compact, inverse = false }) {
  return (
    <div
      style={{
        color: inverse ? "#ffffff" : "#0f172a",
        fontSize: compact ? 14 : 30,
        fontWeight: 950,
        lineHeight: 1.02,
        letterSpacing: "-0.04em",
      }}
    >
      {children}
    </div>
  );
}

function ProductVisual({ compact, tone = "neutral" }) {
  const gradients = {
    neutral: "linear-gradient(135deg, #e5e7eb, #ffffff)",
    beauty: "linear-gradient(135deg, #fecdd3, #fff1f2)",
    fashion: "linear-gradient(135deg, #cbd5e1, #f8fafc)",
    fmcg: "linear-gradient(135deg, #bbf7d0, #fef3c7)",
    luxury: "linear-gradient(135deg, #fef3c7, #f5d0fe)",
  };

  return (
    <div
      style={{
        aspectRatio: "1 / 1",
        borderRadius: compact ? 8 : 14,
        background: gradients[tone] || gradients.neutral,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: compact ? 24 : 54,
          height: compact ? 34 : 74,
          borderRadius: compact ? 8 : 18,
          background: "rgba(255,255,255,0.72)",
          boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.08)",
        }}
      />
    </div>
  );
}

function ProductCard({ compact, name = "Glow Serum", price = "$24", badge = "Bestseller" }) {
  return (
    <div
      style={{
        borderRadius: compact ? 9 : 14,
        background: "rgba(255,255,255,0.92)",
        padding: compact ? 6 : 10,
        display: "grid",
        gap: compact ? 5 : 8,
        boxShadow: "0 16px 34px rgba(15,23,42,0.12)",
      }}
    >
      <ProductVisual compact={compact} tone={name.includes("Serum") ? "beauty" : name.includes("Kurta") ? "fashion" : "fmcg"} />
      <PreviewLabel compact={compact}>{name}</PreviewLabel>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "center" }}>
        <PreviewLabel compact={compact} muted>{price}</PreviewLabel>
        <span
          style={{
            display: compact ? "none" : "inline-flex",
            padding: "4px 6px",
            borderRadius: 999,
            background: "#dcfce7",
            color: "#166534",
            fontSize: 9,
            fontWeight: 900,
          }}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

function HeaderPreview({ compact }) {
  return (
    <div style={{ display: "grid", gap: compact ? 8 : 14, alignContent: "start" }}>
      <div
        style={{
          height: compact ? 30 : 52,
          borderRadius: 999,
          background: "rgba(255,255,255,0.94)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: compact ? "0 10px" : "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: compact ? 6 : 10 }}>
          <div style={{ width: compact ? 18 : 30, height: compact ? 18 : 30, borderRadius: 999, background: "#111827", color: "#ffffff", display: "grid", placeItems: "center", fontSize: compact ? 9 : 13, fontWeight: 950 }}>S</div>
          <PreviewLabel compact={compact}>SILK & CO</PreviewLabel>
        </div>
        <div style={{ display: "flex", gap: compact ? 6 : 12 }}>
          {["Shop", "New", "Sale"].map((item) => (
            <PreviewLabel key={item} compact={compact} muted>{item}</PreviewLabel>
          ))}
        </div>
      </div>
      <div
        style={{
          height: compact ? 36 : 64,
          borderRadius: compact ? 12 : 18,
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: compact ? 10 : 13,
          fontWeight: 900,
          letterSpacing: "0.02em",
        }}
      >
        Free shipping over $49 - New drop live
      </div>
    </div>
  );
}

function HeroPreview({ compact }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr .95fr",
        gap: compact ? 8 : 18,
        alignItems: "center",
      }}
    >
      <div style={{ display: "grid", gap: compact ? 7 : 13 }}>
        <PreviewLabel compact={compact} inverse>Premium launch</PreviewLabel>
        <PreviewHeading compact={compact} inverse>
          {compact ? "New season edit" : "Build a premium ritual"}
        </PreviewHeading>
        <PreviewLabel compact={compact} inverse>Clean products, fast checkout, stronger trust.</PreviewLabel>
        <div style={{ width: compact ? 84 : 138, height: compact ? 22 : 38, borderRadius: 999, background: "#ffffff", display: "grid", placeItems: "center" }}>
          <PreviewLabel compact={compact}>Shop now</PreviewLabel>
        </div>
      </div>
      <div
        style={{
          minHeight: compact ? 78 : 210,
          borderRadius: compact ? 14 : 24,
          background: "rgba(255,255,255,0.9)",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 20px 46px rgba(15,23,42,0.18)",
        }}
      >
        <ProductVisual compact={compact} tone="luxury" />
      </div>
    </div>
  );
}

function CollectionPreview({ compact }) {
  return (
    <div style={{ display: "grid", gap: compact ? 8 : 14, alignContent: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PreviewHeading compact={compact} inverse>Best sellers</PreviewHeading>
        <PreviewLabel compact={compact} inverse>View all</PreviewLabel>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: compact ? 6 : 12 }}>
        <ProductCard compact={compact} name="Glow Serum" price="$28" />
        <ProductCard compact={compact} name="Cotton Kurta" price="$42" />
        <ProductCard compact={compact} name="Daily Pack" price="$18" />
      </div>
    </div>
  );
}

function ProductShowcasePreview({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: compact ? 8 : 16, alignItems: "center" }}>
      <div style={{ borderRadius: compact ? 13 : 22, background: "rgba(255,255,255,0.9)", minHeight: compact ? 84 : 220, display: "grid", placeItems: "center" }}>
        <ProductVisual compact={compact} tone="beauty" />
      </div>
      <div style={{ display: "grid", gap: compact ? 6 : 11 }}>
        <PreviewLabel compact={compact} inverse>Complete routine</PreviewLabel>
        <PreviewHeading compact={compact} inverse>Bundle & save 20%</PreviewHeading>
        {["Cleanser", "Serum", "Moisturizer"].map((item) => (
          <div key={item} style={{ height: compact ? 14 : 28, borderRadius: 999, background: "rgba(255,255,255,0.78)", display: "flex", alignItems: "center", padding: compact ? "0 7px" : "0 13px" }}>
            <PreviewLabel compact={compact}>{item}</PreviewLabel>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustPreview({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: compact ? 7 : 12, alignContent: "center" }}>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} style={{ borderRadius: compact ? 10 : 16, background: "rgba(255,255,255,0.92)", padding: compact ? 7 : 13, display: "flex", gap: compact ? 6 : 10, alignItems: "center" }}>
          <div style={{ width: compact ? 18 : 34, height: compact ? 18 : 34, borderRadius: 999, background: "rgba(15,23,42,0.14)", display: "grid", placeItems: "center", fontSize: compact ? 8 : 14 }}>
            {["✓", "₹", "↺", "★"][item]}
          </div>
          <div style={{ display: "grid", gap: compact ? 4 : 6, flex: 1 }}>
            <PreviewLabel compact={compact}>{["Secure", "COD", "Returns", "Quality"][item]}</PreviewLabel>
            <PreviewLabel compact={compact} muted>{["Payment", "Available", "Easy", "Checked"][item]}</PreviewLabel>
          </div>
        </div>
      ))}
    </div>
  );
}

function TestimonialsPreview({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: compact ? 6 : 12, alignContent: "center" }}>
      {[0, 1, 2].map((item) => (
        <div key={item} style={{ borderRadius: compact ? 10 : 16, background: "rgba(255,255,255,0.92)", padding: compact ? 7 : 14, display: "grid", gap: compact ? 6 : 10 }}>
          <PreviewLabel compact={compact}>★★★★★</PreviewLabel>
          <PreviewLabel compact={compact} muted>"Looks premium and converts."</PreviewLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: compact ? 18 : 30, height: compact ? 18 : 30, borderRadius: 999, background: "rgba(15,23,42,0.14)" }} />
            <PreviewLabel compact={compact}>Aarav</PreviewLabel>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryGridPreview({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: compact ? 6 : 12, alignContent: "center" }}>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} style={{ borderRadius: compact ? 11 : 18, background: "rgba(255,255,255,0.9)", minHeight: compact ? 82 : 204, padding: compact ? 7 : 12, display: "grid", alignContent: "end" }}>
          <PreviewLabel compact={compact}>{["Skincare", "Apparel", "Kitchen", "Gifts"][item]}</PreviewLabel>
        </div>
      ))}
    </div>
  );
}

function OfferPreview({ compact }) {
  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "100%", borderRadius: compact ? 14 : 24, background: "rgba(255,255,255,0.94)", padding: compact ? 14 : 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
        <div style={{ display: "grid", gap: compact ? 7 : 12 }}>
          <PreviewLabel compact={compact} muted>Limited offer</PreviewLabel>
          <PreviewHeading compact={compact}>Buy 2 get 1 free</PreviewHeading>
          <PreviewLabel compact={compact} muted>Auto-applied at checkout today.</PreviewLabel>
        </div>
        <div style={{ width: compact ? 66 : 118, height: compact ? 28 : 44, borderRadius: 999, background: "#111827", display: "grid", placeItems: "center" }}>
          <PreviewLabel compact={compact} inverse>Claim</PreviewLabel>
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: compact ? 7 : 14, alignContent: "center" }}>
      {[0, 1, 2].map((item) => (
        <div key={item} style={{ aspectRatio: "9 / 15", borderRadius: compact ? 12 : 20, background: "rgba(255,255,255,0.88)", display: "grid", placeItems: "center" }}>
          <div style={{ display: "grid", placeItems: "center", gap: compact ? 5 : 10 }}>
            <div style={{ width: 0, height: 0, borderTop: compact ? "8px solid transparent" : "14px solid transparent", borderBottom: compact ? "8px solid transparent" : "14px solid transparent", borderLeft: compact ? "13px solid #111827" : "22px solid #111827" }} />
            <PreviewLabel compact={compact} muted>UGC</PreviewLabel>
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandStoryPreview({ compact }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: compact ? 8 : 18, alignItems: "center" }}>
      <div style={{ borderRadius: compact ? 14 : 24, background: "rgba(255,255,255,0.9)", minHeight: compact ? 90 : 220 }} />
      <div style={{ display: "grid", gap: compact ? 7 : 13 }}>
        <PreviewLabel compact={compact} inverse>Our story</PreviewLabel>
        <PreviewHeading compact={compact} inverse>Made with care</PreviewHeading>
        <PreviewLabel compact={compact} inverse>Founder-led products, thoughtful sourcing, everyday rituals.</PreviewLabel>
      </div>
    </div>
  );
}

function FaqPreview({ compact }) {
  return (
    <div style={{ display: "grid", gap: compact ? 7 : 12, alignContent: "center" }}>
      <PreviewHeading compact={compact} inverse>Questions?</PreviewHeading>
      {["Shipping timeline", "Return policy", "How to use it", "COD available"].map((item) => (
        <div key={item} style={{ height: compact ? 20 : 42, borderRadius: compact ? 10 : 14, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: compact ? "0 9px" : "0 16px" }}>
          <PreviewLabel compact={compact}>{item}</PreviewLabel>
          <PreviewLabel compact={compact}>+</PreviewLabel>
        </div>
      ))}
    </div>
  );
}

function FooterPreview({ compact }) {
  return (
    <div style={{ display: "grid", alignContent: "end", gap: compact ? 8 : 14 }}>
      <div style={{ borderRadius: compact ? 12 : 20, background: "rgba(255,255,255,0.94)", padding: compact ? 10 : 20, display: "grid", gridTemplateColumns: "1.2fr repeat(3, .8fr)", gap: compact ? 8 : 16 }}>
        {["SIMPLI", "Shop", "Support", "Social"].map((item) => (
          <div key={item} style={{ display: "grid", gap: compact ? 5 : 8 }}>
            <PreviewLabel compact={compact}>{item}</PreviewLabel>
            <PreviewLabel compact={compact} muted>About</PreviewLabel>
            <PreviewLabel compact={compact} muted>Contact</PreviewLabel>
          </div>
        ))}
      </div>
      <div style={{ height: compact ? 16 : 28, borderRadius: 999, background: "rgba(255,255,255,0.22)", display: "grid", placeItems: "center" }}>
        <PreviewLabel compact={compact} inverse>Secure payments | Fast shipping | Easy returns</PreviewLabel>
      </div>
    </div>
  );
}

function PreviewArtwork({ section, compact = false }) {
  const previewByType = {
    header: HeaderPreview,
    "homepage-hero": HeroPreview,
    "featured-collection": CollectionPreview,
    "product-showcase": ProductShowcasePreview,
    "trust-badges": TrustPreview,
    testimonials: TestimonialsPreview,
    "category-grid": CategoryGridPreview,
    "offer-banner": OfferPreview,
    "video-reels": VideoPreview,
    "brand-story": BrandStoryPreview,
    faq: FaqPreview,
    footer: FooterPreview,
  };
  const SpecificPreview = previewByType[section.sectionType] || HeroPreview;

  return (
    <PreviewShell section={section} compact={compact}>
      <SpecificPreview compact={compact} />
    </PreviewShell>
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

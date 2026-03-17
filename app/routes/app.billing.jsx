import { useLoaderData, useLocation } from "react-router";
import { authenticate } from "../shopify.server";
import { SECTION_CATALOG } from "../data/sections";

const META_NAMESPACE = "simpli_sections";
const META_KEY = "unlocked_sections";

const PURCHASE_NAME_TO_HANDLE = {
  "Simpli Sections — Pro Offer Bar": "pro_offer_bar",
  "Simpli Sections — Trust Badges": "trust_badges",
};

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

function HowItWorksCard() {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 22,
        padding: 20,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 18,
          marginBottom: 10,
          color: "#101828",
          letterSpacing: "-0.02em",
        }}
      >
        How it works
      </div>

      <div
        style={{
          color: "#667085",
          lineHeight: 1.8,
          fontWeight: 500,
          fontSize: 15,
        }}
      >
        1. Purchase a section or unlock the unlimited plan.
        <br />
        2. Open your Shopify theme customizer.
        <br />
        3. Add the Simpli Sections app block where you want it to appear.
        <br />
        4. Customize styles and publish your theme.
      </div>
    </div>
  );
}

function LiveSectionCard({ section, unlocked, buyHref, featured = false }) {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 28,
        background: "#ffffff",
        boxShadow: "0 14px 36px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: featured ? 190 : 150,
          background: featured
            ? "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 38%, #ecfeff 100%)"
            : "linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #f5f3ff 100%)",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          padding: 26,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#4f46e5",
              marginBottom: 10,
            }}
          >
            {featured ? "Featured Section" : "Premium Section"}
          </div>
          <div
            style={{
              fontSize: featured ? 50 : 34,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              color: "#0f172a",
            }}
          >
            {section.title}
          </div>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <p
          style={{
            marginTop: 0,
            marginBottom: 18,
            color: "#667085",
            lineHeight: 1.8,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {section.description}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {["Premium UI", "One-time purchase", "Theme editor ready"].map(
            (item) => (
              <div
                key={item}
                style={{
                  padding: "9px 13px",
                  borderRadius: 999,
                  background: "#f5f7fb",
                  color: "#344054",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "1px solid rgba(15,23,42,0.04)",
                }}
              >
                {item}
              </div>
            ),
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "#667085",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Price
            </div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: "#101828",
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              ${section.price}
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#667085",
                  marginLeft: 8,
                }}
              >
                one-time
              </span>
            </div>
          </div>

          {unlocked ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 18px",
                borderRadius: 14,
                background: "#e8f7ee",
                color: "#157347",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 18 }}>✓</span>
              Unlocked
            </div>
          ) : (
            <a
              href={buyHref}
              style={{
                display: "inline-block",
                padding: "14px 20px",
                borderRadius: 14,
                background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "-0.01em",
                boxShadow: "0 14px 24px rgba(17,24,39,0.16)",
              }}
            >
              Buy now
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const data = useLoaderData();
  const location = useLocation();

  const liveSections = data.sections.filter(
    (section) => section.status === "live",
  );

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
              "radial-gradient(circle at top left, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0) 30%), linear-gradient(135deg, #081226 0%, #0b1731 45%, #1b2a44 100%)",
            color: "#ffffff",
            marginBottom: 22,
            boxShadow: "0 18px 40px rgba(2,6,23,0.18)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              filter: "blur(6px)",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              marginBottom: 16,
              position: "relative",
              zIndex: 1,
            }}
          >
            Simpli Sections
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 50,
              lineHeight: 1.04,
              letterSpacing: "-0.05em",
              fontWeight: 800,
              maxWidth: 760,
              position: "relative",
              zIndex: 1,
            }}
          >
            Conversion-focused Shopify sections
          </h1>

          <p
            style={{
              margin: "16px 0 0 0",
              maxWidth: 760,
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.8,
              fontSize: 16,
              fontWeight: 500,
              position: "relative",
              zIndex: 1,
            }}
          >
            Buy premium Shopify sections one by one or unlock everything with the
            unlimited plan. Approved purchases are synced and unlocked
            automatically inside your app.
          </p>
        </div>

        <HowItWorksCard />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            {liveSections.map((section, index) => {
              const params = new URLSearchParams(location.search);
              params.set("section", section.handle);

              const buyHref = `/app/buy?${params.toString()}`;
              const unlocked =
                data.hasUnlimitedPlan || data.unlocked.includes(section.handle);

              return (
                <LiveSectionCard
                  key={section.handle}
                  section={section}
                  unlocked={unlocked}
                  buyHref={buyHref}
                  featured={index === 0}
                />
              );
            })}
          </div>

          <div
            style={{
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: 28,
              padding: 24,
              background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
              boxShadow: "0 14px 36px rgba(15,23,42,0.06)",
              height: "fit-content",
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
                background: "#ede9fe",
                color: "#6d28d9",
                marginBottom: 14,
              }}
            >
              Unlimited plan
            </div>

            <h2
              style={{
                marginTop: 0,
                marginBottom: 10,
                fontSize: 42,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: "#101828",
                fontWeight: 800,
              }}
            >
              Unlimited Access
            </h2>

            <p
              style={{
                marginTop: 0,
                color: "#667085",
                lineHeight: 1.8,
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              Unlock all current and future sections with one monthly plan.
              Great for merchants who want a full CRO-focused section library.
            </p>

            <div style={{ margin: "18px 0 18px 0" }}>
              <div
                style={{
                  fontSize: 44,
                  lineHeight: 1,
                  fontWeight: 800,
                  color: "#101828",
                  letterSpacing: "-0.05em",
                }}
              >
                $19
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#667085",
                    marginLeft: 8,
                  }}
                >
                  / month
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                "All premium sections",
                "Future section releases",
                "Faster store building workflow",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#344054",
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "#16a34a", fontWeight: 800 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>

            {data.hasUnlimitedPlan ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "#e8f7ee",
                  color: "#157347",
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 18 }}>✓</span>
                Unlimited Active
              </div>
            ) : (
              <a
                href={`/app/upgrade?${new URLSearchParams(location.search).toString()}`}
                style={{
                  display: "inline-block",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 14px 24px rgba(17,24,39,0.16)",
                }}
              >
                Get Unlimited
              </a>
            )}
          </div>
        </div>

        <div
          style={{
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 22,
            padding: 20,
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 10,
              color: "#101828",
              letterSpacing: "-0.02em",
            }}
          >
            Unlocked sections
          </div>

          <div
            style={{
              color: "#667085",
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            {data.hasUnlimitedPlan
              ? "All current premium sections unlocked via unlimited plan"
              : data.unlocked.length
                ? data.unlocked
                    .filter(
                      (item) =>
                        item !== "__all_access__" &&
                        SECTION_CATALOG.some((section) => section.handle === item),
                    )
                    .join(", ")
                : "(none yet)"}
          </div>
        </div>
      </div>
    </>
  );
}
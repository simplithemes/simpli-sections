import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { SECTION_CATALOG } from "../data/sections";

const SECTION_DISPLAY_NAMES = {
  pro_offer_bar: "Pro Offer Bar",
  trust_badges: "Trust Badges",
};

function getSectionByHandle(handle) {
  return SECTION_CATALOG.find((item) => item.handle === handle) || null;
}

export async function loader({ request }) {
  const url = new URL(request.url);

  const sectionHandle = url.searchParams.get("section") || "";
  const host = url.searchParams.get("host") || "";
  const shop = url.searchParams.get("shop") || "";

  if (!sectionHandle) {
    throw new Response("Missing ?section=", { status: 400 });
  }

  const section = getSectionByHandle(sectionHandle);

  if (!section || section.status !== "live") {
    throw new Response("Invalid or unavailable section", { status: 404 });
  }

  if (!host || !shop) {
    const qs = new URLSearchParams();
    qs.set("returnTo", `/app/buy?section=${encodeURIComponent(sectionHandle)}`);
    if (host) qs.set("host", host);
    if (shop) qs.set("shop", shop);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/app/reauth?${qs.toString()}`,
      },
    });
  }

  const { admin } = await authenticate.admin(request);

  const appUrl = process.env.SHOPIFY_APP_URL;
  if (!appUrl) {
    return {
      ok: false,
      sectionTitle: section.title,
      confirmationUrl: "",
      errors: [{ message: "SHOPIFY_APP_URL is not configured." }],
    };
  }

  const returnUrl = new URL(`${appUrl}/app/return`);
  returnUrl.searchParams.set("section", sectionHandle);
  returnUrl.searchParams.set("host", host);
  returnUrl.searchParams.set("shop", shop);

  const mutation = `#graphql
    mutation AppPurchaseOneTimeCreate(
      $name: String!
      $returnUrl: URL!
      $price: MoneyInput!
      $test: Boolean
    ) {
      appPurchaseOneTimeCreate(
        name: $name
        returnUrl: $returnUrl
        price: $price
        test: $test
      ) {
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    name: `Simpli Sections — ${SECTION_DISPLAY_NAMES[section.handle] || section.title}`,
    returnUrl: returnUrl.toString(),
    price: {
      amount: Number(section.price),
      currencyCode: "USD",
    },
    test: process.env.NODE_ENV !== "production",
  };

  const resp = await admin.graphql(mutation, { variables });
  const json = await resp.json();

  const result = json?.data?.appPurchaseOneTimeCreate;
  const errors = result?.userErrors || [];

  if (errors.length) {
    return {
      ok: false,
      sectionTitle: section.title,
      confirmationUrl: "",
      errors,
    };
  }

  return {
    ok: true,
    sectionTitle: section.title,
    confirmationUrl: result?.confirmationUrl || "",
    errors: [],
  };
}

export default function BuyPage() {
  const { ok, sectionTitle, confirmationUrl, errors } = useLoaderData();

  useEffect(() => {
    if (!ok || !confirmationUrl) return;

    try {
      if (window.top) {
        window.top.location.href = confirmationUrl;
        return;
      }
    } catch (error) {
      // fallback below
    }

    window.location.href = confirmationUrl;
  }, [ok, confirmationUrl]);

  if (!ok || errors?.length) {
    return (
      <div
        style={{
          padding: 24,
          maxWidth: 760,
          margin: "0 auto",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: "#101828",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 20,
            padding: 24,
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: 10,
              fontSize: 28,
              letterSpacing: "-0.03em",
            }}
          >
            Unable to start checkout
          </h1>

          <p
            style={{
              marginTop: 0,
              color: "#667085",
              lineHeight: 1.7,
            }}
          >
            We could not start the checkout for this section right now. Please
            try again in a moment.
          </p>

          {!!sectionTitle && (
            <p
              style={{
                fontWeight: 700,
                color: "#344054",
              }}
            >
              Section: {sectionTitle}
            </p>
          )}

          <pre
            style={{
              whiteSpace: "pre-wrap",
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: "#f8fafc",
              color: "#475467",
              fontSize: 12,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(errors, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!confirmationUrl) {
    return (
      <div
        style={{
          padding: 24,
          maxWidth: 760,
          margin: "0 auto",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: "#101828",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: 20,
            padding: 24,
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: 10,
              fontSize: 28,
              letterSpacing: "-0.03em",
            }}
          >
            Checkout link not available
          </h1>

          <p
            style={{
              marginTop: 0,
              color: "#667085",
              lineHeight: 1.7,
            }}
          >
            We could not generate the approval link for this purchase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 760,
        margin: "0 auto",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#101828",
      }}
    >
      <div
        style={{
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 20,
          padding: 24,
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: 10,
            fontSize: 28,
            letterSpacing: "-0.03em",
          }}
        >
          Redirecting to Shopify approval
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#667085",
            lineHeight: 1.7,
          }}
        >
          Please approve the one-time purchase to unlock{" "}
          <strong>{sectionTitle}</strong>.
        </p>

        <a
          href={confirmationUrl}
          target="_top"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#111827",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Continue to approval
        </a>
      </div>
    </div>
  );
}
import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

const PLAN_NAME = "Simpli Sections — Unlimited Access";
const PLAN_PRICE = 19.0;
const PLAN_CURRENCY = "USD";

export async function loader({ request }) {
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";
  const shop = url.searchParams.get("shop") || "";

  if (!host || !shop) {
    const qs = new URLSearchParams();
    qs.set("returnTo", "/app/upgrade");
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
      confirmationUrl: "",
      errors: [{ message: "SHOPIFY_APP_URL is not configured." }],
    };
  }

  const returnUrl = new URL(`${appUrl}/app/billing`);
  returnUrl.searchParams.set("plan", "unlimited");
  returnUrl.searchParams.set("host", host);
  returnUrl.searchParams.set("shop", shop);
  returnUrl.searchParams.set("status", "return");

  const mutation = `#graphql
    mutation AppSubscriptionCreate(
      $name: String!
      $returnUrl: URL!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $test: Boolean
      $replacementBehavior: AppSubscriptionReplacementBehavior
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        lineItems: $lineItems
        test: $test
        replacementBehavior: $replacementBehavior
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
    name: PLAN_NAME,
    returnUrl: returnUrl.toString(),
    test: process.env.NODE_ENV !== "production",
    replacementBehavior: "STANDARD",
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            interval: "EVERY_30_DAYS",
            price: {
              amount: PLAN_PRICE,
              currencyCode: PLAN_CURRENCY,
            },
          },
        },
      },
    ],
  };

  const resp = await admin.graphql(mutation, { variables });
  const json = await resp.json();

  const result = json?.data?.appSubscriptionCreate;
  const errors = result?.userErrors || [];

  if (errors.length) {
    return {
      ok: false,
      confirmationUrl: "",
      errors,
    };
  }

  return {
    ok: true,
    confirmationUrl: result?.confirmationUrl || "",
    errors: [],
  };
}

export default function UpgradePage() {
  const { ok, confirmationUrl, errors } = useLoaderData();

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
            Unable to start subscription approval
          </h1>

          <p
            style={{
              marginTop: 0,
              color: "#667085",
              lineHeight: 1.7,
            }}
          >
            We could not start the unlimited plan approval right now. Please try
            again in a moment.
          </p>

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
            Subscription link not available
          </h1>

          <p
            style={{
              marginTop: 0,
              color: "#667085",
              lineHeight: 1.7,
            }}
          >
            We could not generate the approval link for the unlimited plan.
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
          Please approve the <strong>Unlimited Access</strong> subscription to
          unlock all current and future premium sections.
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
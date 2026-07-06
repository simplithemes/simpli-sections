import {
  Outlet,
  useLoaderData,
  useRouteError,
  useLocation,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

const META_NAMESPACE = "simpli_sections";
const META_KEY = "unlocked_sections";

const UNLIMITED_PLAN_NAMES = [
  "Simpli Sections — Unlimited Access",
  "Unlimited Access",
  "Unlimited",
  "Unlimited Sections",
  "Simpli Sections Unlimited",
];

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

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
        }
      }
    }
  `;

  const resp = await admin.graphql(query);
  const json = await resp.json();

  const unlockedValue = json?.data?.shop?.metafield?.value || "";

  const unlocked = unlockedValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const activeSubscriptions =
    json?.data?.currentAppInstallation?.activeSubscriptions || [];

  const hasActiveUnlimitedSubscription = activeSubscriptions.some((sub) => {
    const name = String(sub?.name || "").trim().toLowerCase();
    const status = String(sub?.status || "").trim().toUpperCase();

    return (
      status === "ACTIVE" &&
      UNLIMITED_PLAN_NAMES.some((planName) =>
        name.includes(planName.toLowerCase()),
      )
    );
  });

  const hasUnlimitedMetafield = unlocked.includes("__all_access__");

  const hasUnlimitedPlan =
    hasActiveUnlimitedSubscription || hasUnlimitedMetafield;

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    unlocked,
    hasUnlimitedPlan,
    activeSubscriptions,
  };
};

export default function App() {
  const { apiKey, unlocked, hasUnlimitedPlan } = useLoaderData();
  const location = useLocation();
  const qs = location.search || "";

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href={`/app${qs}`}>Website Builder</s-link>
        <s-link href={`/app/additional${qs}`}>My Sections</s-link>
      </s-app-nav>

      <Outlet context={{ unlocked, hasUnlimitedPlan, apiKey }} />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

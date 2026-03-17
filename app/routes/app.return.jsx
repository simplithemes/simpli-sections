import { authenticate } from "../shopify.server";
import { hasActiveOneTimePurchaseForSection } from "../shopify.server";
import { SECTION_CATALOG } from "../data/sections";

const META_NAMESPACE = "simpli_sections";
const META_KEY = "unlocked_sections";

function getSectionByHandle(handle) {
  return SECTION_CATALOG.find((item) => item.handle === handle) || null;
}

async function getUnlockedSections({ admin }) {
  const query = `#graphql
    query {
      shop {
        id
        metafield(namespace: "${META_NAMESPACE}", key: "${META_KEY}") {
          id
          value
        }
      }
    }
  `;

  const resp = await admin.graphql(query);
  const json = await resp.json();

  const shop = json?.data?.shop;
  const value = shop?.metafield?.value || "";

  const list = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    shopId: shop?.id,
    current: [...new Set(list)].sort(),
  };
}

async function setUnlockedSections({ admin, shopId, list }) {
  const mutation = `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const normalizedList = [...new Set(list)].sort();
  const value = normalizedList.join(",");

  const variables = {
    metafields: [
      {
        ownerId: shopId,
        namespace: META_NAMESPACE,
        key: META_KEY,
        type: "single_line_text_field",
        value,
      },
    ],
  };

  const resp = await admin.graphql(mutation, { variables });
  const json = await resp.json();

  const errors = json?.data?.metafieldsSet?.userErrors || [];
  if (errors.length) {
    const message = errors.map((e) => e.message).join(" | ");
    throw new Error(`metafieldsSet failed: ${message}`);
  }
}

export async function loader({ request }) {
  const url = new URL(request.url);

  const sectionHandle = url.searchParams.get("section") || "";
  const host = url.searchParams.get("host") || "";
  const shop = url.searchParams.get("shop") || "";
  const chargeId = url.searchParams.get("charge_id") || "";

  if (!sectionHandle) {
    throw new Response("Missing ?section=...", { status: 400 });
  }

  const section = getSectionByHandle(sectionHandle);

  if (!section || section.status !== "live") {
    throw new Response("Invalid or unavailable section", { status: 404 });
  }

  let admin;

  try {
    const auth = await authenticate.admin(request);
    admin = auth.admin;
  } catch (error) {
    const qs = new URLSearchParams();
    qs.set(
      "returnTo",
      `/app/return?section=${encodeURIComponent(sectionHandle)}${
        host ? `&host=${encodeURIComponent(host)}` : ""
      }${shop ? `&shop=${encodeURIComponent(shop)}` : ""}${
        chargeId ? `&charge_id=${encodeURIComponent(chargeId)}` : ""
      }`,
    );

    if (host) qs.set("host", host);
    if (shop) qs.set("shop", shop);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/app/reauth?${qs.toString()}`,
      },
    });
  }

  const isActive = await hasActiveOneTimePurchaseForSection({
    admin,
    sectionHandle,
  });

  const redirectParams = new URLSearchParams();
  redirectParams.set("section", sectionHandle);
  if (host) redirectParams.set("host", host);
  if (shop) redirectParams.set("shop", shop);

  if (!isActive) {
    redirectParams.set("status", "pending");

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/app/billing?${redirectParams.toString()}`,
      },
    });
  }

  const { shopId, current } = await getUnlockedSections({ admin });

  if (!shopId) {
    throw new Response("Unable to resolve shop ID", { status: 500 });
  }

  const next = [...new Set([...current, sectionHandle])].sort();

  await setUnlockedSections({
    admin,
    shopId,
    list: next,
  });

  redirectParams.set("status", "active");

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/app/billing?${redirectParams.toString()}`,
    },
  });
}

export default function ReturnPage() {
  return null;
}
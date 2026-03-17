import { useEffect } from "react";
import { useSearchParams } from "react-router";

export default function Reauth() {
  const [params] = useSearchParams();

  useEffect(() => {
    const returnTo = params.get("returnTo") || "/app/billing";
    const shop = params.get("shop");
    const host = params.get("host");

    // IMPORTANT: redirect TOP window to YOUR APP DOMAIN /auth (absolute URL)
    const appOrigin = window.location.origin;

    let authUrl = `${appOrigin}/auth?returnTo=${encodeURIComponent(returnTo)}`;
    if (shop) authUrl += `&shop=${encodeURIComponent(shop)}`;
    if (host) authUrl += `&host=${encodeURIComponent(host)}`;

    if (window.top) window.top.location.href = authUrl;
    else window.location.href = authUrl;
  }, [params]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Reconnecting…</h1>
      <p>Refreshing Shopify session.</p>
    </div>
  );
}
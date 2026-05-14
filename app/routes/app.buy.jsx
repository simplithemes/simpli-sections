import { redirect } from "react-router";

export async function loader({ request }) {
  const url = new URL(request.url);

  const host = url.searchParams.get("host") || "";
  const shop = url.searchParams.get("shop") || "";

  const params = new URLSearchParams();

  if (host) params.set("host", host);
  if (shop) params.set("shop", shop);

  return redirect(`/app/upgrade?${params.toString()}`);
}

export default function BuyPage() {
  return null;
}
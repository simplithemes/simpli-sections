import { login } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // CRITICAL: Only trigger login if shop param exists
  if (url.searchParams.get("shop")) {
    return login(request);
  }

  // If no shop param, do nothing (avoid crash)
  return null;
};

export default function Index() {
  return null;
}
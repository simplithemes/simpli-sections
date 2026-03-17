import { login } from "../shopify.server";

export async function loader({ request }) {
  // This uses the template's login helper to start OAuth
  // It will redirect to /auth and then back into the embedded app
  return login(request);
}

export default function Bounce() {
  return null;
}
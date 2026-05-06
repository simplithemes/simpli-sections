import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  if (errors?.shop) {
    throw new Response("OAuth login failed: missing or invalid shop parameter", {
      status: 400,
    });
  }

  return null;
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));

  if (errors?.shop) {
    throw new Response("OAuth login failed: missing or invalid shop parameter", {
      status: 400,
    });
  }

  return null;
};

export default function Auth() {
  return null;
}
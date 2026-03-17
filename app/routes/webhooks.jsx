// app/routes/webhooks.jsx
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);

    console.log("Webhook received:", { topic, shop });

    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST":
      case "customers/data_request":
        console.log("Handled customers/data_request", payload);
        break;

      case "CUSTOMERS_REDACT":
      case "customers/redact":
        console.log("Handled customers/redact", payload);
        break;

      case "SHOP_REDACT":
      case "shop/redact":
        console.log("Handled shop/redact", payload);
        break;

      case "APP_UNINSTALLED":
      case "app/uninstalled":
        console.log("Handled app/uninstalled", payload);
        break;

      default:
        console.log("Unhandled topic:", topic);
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook authentication failed:", error);
    return new Response("Unauthorized", { status: 401 });
  }
};
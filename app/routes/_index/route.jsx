import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(17,24,39,0.06)",
            color: "#111827",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Simpli Sections
        </div>

        <h1 className={styles.heading}>
          Premium Shopify sections built for conversions
        </h1>

        <p className={styles.text}>
          Add conversion-focused Shopify sections like offer bars and trust
          badges without editing theme code. Install the app and unlock premium
          sections directly inside your Shopify admin.
        </p>

        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Enter your Shopify store domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-store.myshopify.com"
              />
              <span>Example: your-store.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Continue
            </button>
          </Form>
        )}

        <ul className={styles.list}>
          <li>
            <strong>Premium sections.</strong> Launch ready-made Shopify app
            blocks designed to improve store presentation and conversions.
          </li>
          <li>
            <strong>Fast setup.</strong> Purchase a section, add it from the
            theme customizer, and start using it without custom development.
          </li>
          <li>
            <strong>Flexible access.</strong> Buy individual sections or unlock
            the full library with the unlimited plan.
          </li>
        </ul>
      </div>
    </div>
  );
}
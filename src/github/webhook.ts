import type { Context } from "hono";

export async function handleWebhook(c: Context) {
  const payload = await c.req.json();

  console.log("Webhook received");
  console.log(payload.action);

  return c.json({
    success: true,
  });
}
import { Hono } from "hono";
import { handleWebhook } from "./github/webhook";

const app = new Hono();

app.get("/", (c) => {
  return c.text("GitWhisperer is running 🚀");
});

app.post("/webhook", handleWebhook);

export default {
  port: 3000,
  fetch: app.fetch,
};
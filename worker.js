export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      const url = new URL(request.url);

      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === "sainath_verify_123") {
        return new Response(challenge, { status: 200 });
      }

      return new Response("Webhook Live ✅");
    }

    if (request.method === "POST") {
      const body = await request.json();

      const message =
        body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        const from = message.from;
        const text = message.text?.body?.toLowerCase() || "";

        let reply = "🙏 Sainath Homeopathic Pharmacy ma welcome!";

        if (text.includes("hello") || text.includes("hi")) {
          reply = "Hello 😊 Sainath Homeopathic Pharmacy Bot Working!";
        }

        await fetch(
          `https://graph.facebook.com/v25.0/${env.PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              text: { body: reply },
            }),
          }
        );
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Bot Live 🚀");
  },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // WEBHOOK VERIFY
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === "12345") {
        return new Response(challenge, { status: 200 });
      }

      return new Response("Webhook Live ✅");
    }

    // INCOMING MESSAGE
    if (request.method === "POST") {
      try {
        const body = await request.json();

        console.log("Webhook Data:", JSON.stringify(body));

        const message =
          body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {
          const from = message.from;
          const text = message.text?.body?.toLowerCase() || "";

          let reply = "🙏 Sainath Homeopathic Pharmacy ma welcome!";

          if (text.includes("hello") || text.includes("hi")) {
            reply = "Hello 😊 Sainath Homeopathic Pharmacy Bot Working!";
          }

          const res = await fetch(
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

          console.log("Meta Reply Status:", res.status);
        }

        return new Response("OK", { status: 200 });
      } catch (err) {
        console.log("ERROR:", err.message);
        return new Response("Error", { status: 500 });
      }
    }

    return new Response("Bot Live 🚀");
  },
};

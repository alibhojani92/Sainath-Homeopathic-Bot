export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // Webhook verification
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" &&
          token === env.VERIFY_TOKEN) {
        return new Response(challenge, {
          status: 200
        });
      }

      return new Response("Forbidden", {
        status: 403
      });
    }

    // Receive WhatsApp messages
    if (request.method === "POST") {
      try {
        const body = await request.json();

        const message =
          body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {
          const from = message.from;
          const text =
            message.text?.body?.toLowerCase() || "";

          let reply =
            "Welcome to Sainath Homeopathic Pharmacy 😊 Please send your medicine name.";

          // Greetings
          if (
            text === "hi" ||
            text === "hello" ||
            text === "hey"
          ) {
            reply =
`👋 Hello!

Welcome to Sainath Homeopathic Pharmacy 💊

Please send your medicine name.`;
          }

          // Example SBL reply
          if (text.includes("sbl")) {
            reply =
`✅ SBL product available.

Please send product name.`;
          }

          // Send reply
          await fetch(
            `https://graph.facebook.com/v25.0/${env.PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: {
                "Authorization":
                  `Bearer ${env.ACCESS_TOKEN}`,
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: from,
                text: {
                  body: reply
                }
              })
            }
          );
        }

        return new Response("EVENT_RECEIVED", {
          status: 200
        });

      } catch (err) {
        return new Response(
          "Error: " + err.message,
          { status: 500 }
        );
      }
    }

    return new Response("Bot Running 😎");
  }
};

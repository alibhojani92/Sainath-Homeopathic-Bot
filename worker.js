export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // WEBHOOK VERIFY
    if (request.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (
        mode === "subscribe" &&
        token === "sainath_verify_123"
      ) {
        return new Response(challenge, { status: 200 });
      }

      return new Response("Bot Live ✅");
    }

    // WHATSAPP MESSAGE RECEIVE
    if (request.method === "POST") {
      try {
        const body = await request.json();

        const message =
          body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (!message) {
          return new Response("OK");
        }

        const from = message.from;
        const text =
          message.text?.body?.trim().toUpperCase() || "";

        let reply = "❌ Product not found";

        // HI / HELLO
        if (text === "HI" || text === "HELLO") {
          reply = `🙏 Welcome to Sainath Homeopathic Pharmacy

Available Commands:

📦 Available Products
💊 Search Product:
Example:
R89
BC28
WL10`;
        }

        // AVAILABLE PRODUCTS
        else if (
          text === "AVAILABLE PRODUCTS" ||
          text === "PRODUCTS" ||
          text === "LIST"
        ) {
          reply = `📦 Available Categories

1️⃣ SBL
2️⃣ WHEEZAL
3️⃣ GHR
4️⃣ RECKEWEG
5️⃣ COSMETICS
6️⃣ HERBAL

Type category name`;
        }

        // CATEGORY REPLY
        else if (
          [
            "SBL",
            "WHEEZAL",
            "GHR",
            "RECKEWEG",
            "COSMETICS",
            "HERBAL",
          ].includes(text)
        ) {
          reply = `📂 ${text} Category

PDF Catalog Coming Soon ✅

For product search:
Example:
R89
BC28
WL10`;
        }

        // PRODUCT SEARCH
        else if (
          text.startsWith("R") ||
          text.startsWith("BC") ||
          text.startsWith("WL")
        ) {
          reply = `💊 Product: ${text}

💰 MRP: ₹100
🏷 Discount: 25%
🔥 Final Price: ₹75
📦 Stock: 100 pcs

Reply:
BUY ${text}
or
ADD ${text}`;
        }

        // BUY
        else if (text.startsWith("BUY ")) {
          const product = text.replace("BUY ", "");

          reply = `🛒 Order Started

Product: ${product}

Please send quantity.

Example:
2`;
        }

        // ADD TO CART
        else if (text.startsWith("ADD ")) {
          const product = text.replace("ADD ", "");

          reply = `✅ Added to Cart

💊 ${product}
📦 Qty: 1

Type CHECKOUT to continue`;
        }

        // CHECKOUT
        else if (text === "CHECKOUT") {
          reply = `🛒 Checkout Started

Please send:

Name
Address
Payment Method

(COD / UPI)`;
        }

        // SEND MESSAGE
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
              text: {
                body: reply,
              },
            }),
          }
        );

        return new Response("OK", {
          status: 200,
        });
      } catch (err) {
        return new Response("Error", {
          status: 500,
        });
      }
    }

    return new Response("Bot Running 🚀");
  },
};

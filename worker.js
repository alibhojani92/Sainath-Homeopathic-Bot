export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Webhook Verify
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

      return new Response("Webhook Live ✅");
    }

    // Incoming WhatsApp Message
    if (request.method === "POST") {
      try {
        const body = await request.json();

        console.log("Webhook Data:", JSON.stringify(body));

        const message =
          body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {
          const from = message.from;
          const text =
            message.text?.body?.trim().toUpperCase() || "";

          // CSV URL
          const csvUrl =
            "https://raw.githubusercontent.com/alibhojani92/Sainath-Homeopathic-Bot/refs/heads/main/sbl_reckeweg_100_products-1.csv";

          const csvData = await fetch(csvUrl).then((r) =>
            r.text()
          );

          const rows = csvData.split("\n").slice(1);

          let found = null;

          for (const row of rows) {
            const cols = row.split(",");

            const code =
              cols[0]?.trim().toUpperCase();

            const name =
              cols[1]?.trim().toUpperCase();

            if (
              code === text ||
              name.includes(text)
            ) {
              found = {
                name: cols[1],
                mrp: cols[2],
                discount: cols[3],
                price: cols[4],
                stock: cols[5],
                qty: cols[6],
              };
              break;
            }
          }

          let reply =
            "❌ Product not found.\nExample: R89 / BC28";

          if (found) {
            reply = `💊 ${found.name}

💰 MRP: ₹${found.mrp}
🏷 Discount: ${found.discount}%
🔥 Final Price: ₹${found.price}
📦 Stock: ${found.stock} pcs
🛒 Min Qty: ${found.qty}`;
          }

          const metaResponse = await fetch(
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

          console.log(
            "Meta Reply Status:",
            metaResponse.status
          );
        }

        return new Response("OK", {
          status: 200,
        });
      } catch (err) {
        console.log("Error:", err);
        return new Response("Error", {
          status: 500,
        });
      }
    }

    return new Response("Bot Live 🚀");
  },
};

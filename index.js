const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "sainath_verify_123";

const ACCESS_TOKEN =
"EAALu5kVa7DABRUyTXF2amWuAVZBSTotyZBbnKYZBQRoPqDZALeUc4Lus8NenBbN8dEilTHEb95PL6XOC6ZBBo0F5AdgS3rG2kSI0ASevvrbHwE9YXqsakJAdI2GwuTso1ymNEHGyYXNZA9ci1ZA4LNewoTXxYBJmXdzOtF2QK4u9XE6PzkvUsmuyfoZC7ZBHD5VZA9AgZAun1QkKoqA0jThz9I41HZCYW1YtuQ4EQFuG02yiwDXlWRk57wZDZD";

const PHONE_NUMBER_ID = "1160767457110407";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    const message =
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text =
        message.text?.body?.toLowerCase() || "";

      let reply =
        "Welcome to Sainath Homeopathic Pharmacy 😊 Please send your medicine name.";

      if (text === "hi" || text === "hello") {
        reply =
          "👋 Hello! Welcome to Sainath Homeopathic Pharmacy.\n\nPlease send your medicine name.";
      }

      if (text.includes("sbl")) {
        reply =
          "✅ SBL product is available.\nPlease send the product name.";
      }

      await fetch(
        `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
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

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("✅ Bot is running on port 3000");
});

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://luckytips-efe1f-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // MarzPay Collection Route
  app.post("/api/collect-payment", async (req, res) => {
    const { amount, phoneNumber, provider, packageName, userId } = req.body;
    
    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: "Amount and phone number are required" });
    }

    const MARZ_KEY = process.env.MARZ_KEY;
    const MARZ_SECRET = process.env.MARZ_SECRET;

    if (!MARZ_KEY || !MARZ_SECRET) {
      console.error("[MarzPay] Missing API Credentials");
      return res.status(500).json({ error: "Payment provider not configured" });
    }

    // Format phone number (+256 format)
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+256' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('256')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+256' + formattedPhone;
    }

    const reference = uuidv4();
    const authHeader = `Basic ${Buffer.from(`${MARZ_KEY}:${MARZ_SECRET}`).toString('base64')}`;

    try {
      console.log(`[MarzPay] Initiating collection: ref=${reference}, phone=${formattedPhone}, provider=${provider}, amount=${amount}`);

      const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: parseInt(amount),
          phone_number: formattedPhone,
          country: "UG",
          reference: reference,
          description: `Subscription: ${packageName || 'Premium'}`,
          callback_url: `https://${req.get('host')}/api/webhook`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[MarzPay] Collection Error:", data);
        return res.status(response.status).json(data);
      }

      res.json({ 
        success: true, 
        reference, 
        providerResponse: data 
      });
    } catch (error) {
      console.error("[MarzPay] Critical Error:", error);
      res.status(500).json({ error: "Internal payment processing error" });
    }
  });

  // MarzPay Webhook Route
  app.post("/api/webhook", async (req, res) => {
    const payload = req.body;
    console.log("[MarzPay] Webhook Received:", JSON.stringify(payload, null, 2));

    try {
      // Validate Payload Structure
      const eventType = payload.event_type;
      const transaction = payload.transaction;

      if (!transaction || !transaction.reference) {
        console.warn("[MarzPay Webhook] Invalid payload structure");
        return res.status(400).send("Invalid payload");
      }

      const { reference, status } = transaction;
      const paymentRef = db.ref(`payments/${reference}`);
      
      // Update the payment record
      await paymentRef.update({
        status: status, // completed, failed, etc.
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        rawWebhookPayload: payload
      });

      // If payment is completed, grant VIP status to the user
      if (status === 'completed' || eventType === 'collection.completed') {
        const snapshot = await paymentRef.once('value');
        const paymentData = snapshot.val();

        if (paymentData && paymentData.userId && paymentData.userId !== 'anonymous') {
          console.log(`[MarzPay Webhook] Granting VIP to user: ${paymentData.userId}`);
          await db.ref(`users/${paymentData.userId}`).update({
            subscriptionTier: 'vip',
            lastActivated: admin.database.ServerValue.TIMESTAMP
          });
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("[MarzPay] Webhook Internal Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // MarzPay Status Check Route
  app.get("/api/check-status/:reference", async (req, res) => {
    const { reference } = req.params;
    
    const MARZ_KEY = process.env.MARZ_KEY;
    const MARZ_SECRET = process.env.MARZ_SECRET;

    if (!MARZ_KEY || !MARZ_SECRET) {
      return res.status(500).json({ error: "Payment provider not configured" });
    }

    const authHeader = `Basic ${Buffer.from(`${MARZ_KEY}:${MARZ_SECRET}`).toString('base64')}`;

    try {
      const response = await fetch(`https://wallet.wearemarz.com/api/v1/transaction-status?reference=${reference}`, {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[MarzPay] Status Check Error:", error);
      res.status(500).json({ error: "Failed to check transaction status" });
    }
  });

  // Proxy route for team/league logos to avoid CORS
  app.get("/api/proxy/sports", async (req, res) => {
    const { name, search, endpoint } = req.query;
    const API_KEY = "7f1e72e61225defa847ad7d9dbc1d5a9";
    const BASE_URL = "https://v3.football.api-sports.io";

    console.log(`[Proxy] Fetching: endpoint=${endpoint}, name=${name}, search=${search}`);

    let url = "";
    const queryParam = name ? `name=${encodeURIComponent(name as string)}` : `search=${encodeURIComponent(search as string)}`;
    
    if (endpoint === 'leagues') {
      url = `${BASE_URL}/leagues?${queryParam}`;
    } else {
      url = `${BASE_URL}/teams?${queryParam}`;
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY,
        },
      });
      
      if (!response.ok) {
        console.error(`[Proxy] API Error: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: "Upstream API error" });
      }

      const data = await response.json();
      
      // If search returned nothing and it wasn't already a strict name search, we could try name?
      // But search is usually better.
      
      res.json(data);
    } catch (error) {
      console.error("[Proxy] Critical Error:", error);
      res.status(500).json({ error: "Internal proxy error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lucky Tip$ Server running on http://localhost:${PORT}`);
  });
}

startServer();

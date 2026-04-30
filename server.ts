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

  // Test Route for Vercel diagnostic
  app.get("/api/test", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // MarzPay Collection Route
  app.post("/api/collect-payment", async (req, res) => {
    console.log("=== PAYMENT REQUEST ===");
    console.log("Payload:", req.body);
    
    const { amount, phoneNumber, packageName, userId } = req.body;
    
    if (!amount || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Amount and phone number are required" 
      });
    }

    const MARZ_KEY = process.env.MARZ_KEY;
    const MARZ_SECRET = process.env.MARZ_SECRET;

    if (!MARZ_KEY || !MARZ_SECRET) {
      console.error("[MarzPay] Missing API Credentials");
      return res.status(500).json({ 
        success: false, 
        message: "Payment provider not configured in environment" 
      });
    }

    // Phone Format (STRICT)
    let phone = phoneNumber.replace(/\s+/g, '');
    if (phone.startsWith('0')) {
      phone = '+256' + phone.substring(1);
    }
    if (!phone.startsWith('+256')) {
      phone = '+256' + phone;
    }

    const reference = uuidv4();
    const credentials = Buffer.from(`${MARZ_KEY}:${MARZ_SECRET}`).toString('base64');
    
    // Callback URL (AUTO DETECT)
    const host = req.headers.host || 'lucky-tips.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${host}`;
    const callback_url = `${baseUrl}/api/webhook`;

    const requestPayload = {
      amount: parseInt(amount),
      phone_number: phone,
      country: "UG",
      reference: reference,
      description: packageName || 'Premium Subscription',
      callback_url: callback_url
    };

    try {
      console.log(`[MarzPay] Outgoing Request Payload:`, JSON.stringify(requestPayload, null, 2));

      const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      console.log("=== MARZPAY RESPONSE STATUS ===", response.status);

      // Safe JSON Parsing
      let data;
      const rawText = await response.text();
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error("Invalid JSON from MarzPay:", rawText);
        return res.status(500).json({ 
          success: false,
          message: "Invalid response from payment provider", 
          raw: rawText 
        });
      }

      console.log("=== MARZPAY RESPONSE BODY ===", data);

      if (!response.ok) {
        return res.status(400).json({
          success: false,
          message: data.message || "Payment initiation failed",
          error: data
        });
      }

      // If MarzPay returns a success but logically it's not
      if (data.status === "failed" || data.status === "error") {
        return res.status(400).json({
          success: false,
          message: data.message || "Provider returned an error",
          error: data
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: "Payment initiated",
        reference: reference, 
        data 
      });
    } catch (error) {
      console.error("[MarzPay] Critical Internal Error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to initiate payment due to a server-side error" 
      });
    }
  });

  // MarzPay Webhook Route
  app.post("/api/webhook", async (req, res) => {
    console.log("=== MARZPAY WEBHOOK RECEIVED ===");
    console.log("Payload:", JSON.stringify(req.body, null, 2));
    
    const payload = req.body;

    try {
      const eventType = payload.event_type;
      const transaction = payload.transaction;

      if (!transaction || !transaction.reference) {
        console.warn("[MarzPay Webhook] Missing transaction.reference in payload");
        return res.status(400).json({ success: false, message: "Invalid payload: missing reference" });
      }

      const { reference } = transaction;
      const paymentRef = db.ref(`payments/${reference}`);
      
      // Determine final status mapping
      let finalStatus = 'pending';
      if (eventType === 'collection.completed') {
        finalStatus = 'completed';
      } else if (eventType === 'collection.failed') {
        finalStatus = 'failed';
      } else if (eventType === 'collection.cancelled') {
        finalStatus = 'cancelled';
      }

      console.log(`[MarzPay Webhook] Updating reference ${reference} to ${finalStatus}`);

      // Update Firebase RTDB
      await paymentRef.update({
        status: finalStatus,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        webhookPayload: payload
      });

      // Grant VIP on success
      if (finalStatus === 'completed') {
        const snapshot = await paymentRef.once('value');
        const paymentData = snapshot.val();

        if (paymentData && paymentData.userId && paymentData.userId !== 'anonymous') {
          console.log(`[MarzPay Webhook] Granting VIP Access: ${paymentData.userId}`);
          await db.ref(`users/${paymentData.userId}`).update({
            subscriptionTier: 'vip',
            lastActivated: admin.database.ServerValue.TIMESTAMP
          });
        }
      }

      return res.status(200).json({ received: true, success: true });
    } catch (error) {
      console.error("[MarzPay Webhook] Processing Error:", error);
      return res.status(200).json({ received: true, success: false, error: "Internal processing error" });
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

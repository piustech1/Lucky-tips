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
    console.log("[Backend] Incoming request to /api/collect-payment:", req.body);
    const { amount, phoneNumber, provider, packageName, userId } = req.body;
    
    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: "Amount and phone number are required" });
    }

    const MARZ_KEY = process.env.MARZ_KEY;
    const MARZ_SECRET = process.env.MARZ_SECRET;

    if (!MARZ_KEY || !MARZ_SECRET) {
      console.error("[MarzPay] Missing API Credentials");
      return res.status(500).json({ error: "Payment provider not configured in environment" });
    }

    // Format phone number STRICTLY to: +256XXXXXXXXX (12 digits including +)
    // Remove any non-digits
    let cleanDigits = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 07..., transform to 2567...
    if (cleanDigits.startsWith('0') && cleanDigits.length === 10) {
      cleanDigits = '256' + cleanDigits.substring(1);
    }
    // Ensure it has 256 prefix
    if (!cleanDigits.startsWith('256')) {
      cleanDigits = '256' + cleanDigits;
    }
    const formattedPhone = '+' + cleanDigits;

    const reference = uuidv4();
    const authHeader = `Basic ${Buffer.from(`${MARZ_KEY}:${MARZ_SECRET}`).toString('base64')}`;
    
    // Dynamic baseUrl detection for callback
    const host = req.headers.host || 'lucky-tips.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${host}`;
    const callback_url = `${baseUrl}/api/webhook`;

    const requestPayload = {
      amount: parseInt(amount),
      phone_number: formattedPhone,
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
          "Authorization": authHeader,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      console.log(`[MarzPay] Response Status: ${response.status}`);

      const rawText = await response.text();
      console.log(`[MarzPay] Raw Response:`, rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error("[MarzPay] Invalid JSON from MarzPay API:", rawText);
        return res.status(500).json({ 
          error: "Invalid JSON response from MarzPay", 
          raw: rawText 
        });
      }

      if (!response.ok) {
        console.error("[MarzPay] Request Failed:", data);
        return res.status(response.status).json({
          error: "MarzPay request failed",
          status: response.status,
          details: data
        });
      }

      res.status(200).json({ 
        success: true, 
        reference, 
        data 
      });
    } catch (error) {
      console.error("[MarzPay] Critical Internal Error:", error);
      res.status(500).json({ error: "Failed to initiate payment due to a server-side error" });
    }
  });

  // MarzPay Webhook Route
  app.post("/api/webhook", async (req, res) => {
    console.log("[MarzPay Webhook] Received Payload:", JSON.stringify(req.body, null, 2));
    const payload = req.body;

    try {
      const eventType = payload.event_type;
      const transaction = payload.transaction;

      if (!transaction || !transaction.reference) {
        console.warn("[MarzPay Webhook] Missing transaction.reference in payload");
        return res.status(400).json({ error: "Invalid payload: missing reference" });
      }

      const { reference } = transaction;
      const paymentRef = db.ref(`payments/${reference}`);
      
      // Map MarzPay events to our status system
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
          console.log(`[MarzPay Webhook] Activating VIP for user: ${paymentData.userId}`);
          await db.ref(`users/${paymentData.userId}`).update({
            subscriptionTier: 'vip',
            lastActivated: admin.database.ServerValue.TIMESTAMP
          });
        }
      }

      return res.status(200).json({ received: true, status: finalStatus });
    } catch (error) {
      console.error("[MarzPay Webhook] Processing Error:", error);
      // Still return 200 to acknowledge receipt of webhook from provider, but log the error locally
      return res.status(200).json({ error: "Processed with internal error", details: error instanceof Error ? error.message : String(error) });
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

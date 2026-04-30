import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

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

  // Mock Authentication (allows any credentials for now)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Mock success for any credentials
    res.json({ success: true, token: "mock_jwt_token", user: { email, name: "King User" } });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { email, name, password } = req.body;
    // Mock success for any credentials
    res.json({ success: true, token: "mock_jwt_token", user: { email, name } });
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

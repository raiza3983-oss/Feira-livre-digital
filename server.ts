import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000; // Hardcoded to 3000 as per platform requirements

  // Global logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  console.log(`[Server] Starting process...`);
  console.log(`[Server] Node: ${process.version}`);
  console.log(`[Server] CWD: ${process.cwd()}`);
  console.log(`[Server] ENV: ${process.env.NODE_ENV}`);

  // API diagnostic routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      mode: process.env.NODE_ENV, 
      cwd: process.cwd(),
      time: new Date().toISOString()
    });
  });

  app.get("/ping", (req, res) => {
    res.send("pong " + new Date().toISOString());
  });

  const distPath = path.resolve(process.cwd(), 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mode: DEVELOPMENT (Vite)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Mode: PRODUCTION (Static)");
    console.log(`[Server] Static Path: ${distPath}`);
    
    if (fs.existsSync(distPath)) {
      console.log(`[Server] Contents of dist: ${fs.readdirSync(distPath)}`);
    } else {
      console.error(`[Server] ERROR: dist directory not found!`);
    }

    // Serve static files from /dist
    app.use(express.static(distPath));
    
    // Hand-crafted route for /
    app.get("/", (req, res) => {
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(500).send("index.html not found in dist/ - please check build logs");
      }
    });

    // Fallback for SPA routing - serve index.html for all other non-file routes
    app.get('*', (req, res) => {
      // If the request is for an asset that doesn't exist, this might catch it.
      // But for routes like /privacy, it should serve index.html.
      if (fs.existsSync(indexHtmlPath)) {
        res.sendFile(indexHtmlPath);
      } else {
        res.status(404).send("Application shell (index.html) not found.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] App is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] FATAL STARTUP ERROR:", err);
  process.exit(1);
});

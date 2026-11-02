import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { testPostgresConnection, initializeDatabase } from "./config/db.js";
import { checkOllamaHealth } from "./services/ai-stylist.service.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      config.frontendUrl,
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Health Check Endpoint
app.get("/health", async (_req, res) => {
  const pgStatus = await testPostgresConnection();
  const ollamaStatus = await checkOllamaHealth();

  res.json({
    status: "ok",
    app: "Daily Outfit Studio Backend",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: {
      driver: "PostgreSQL (postgres.js)",
      status: pgStatus.connected ? "connected" : pgStatus.error || "not configured",
      version: pgStatus.version,
      name: pgStatus.database,
    },
    services: {
      supabaseBridge: Boolean(config.supabase.url),
      geminiAi: Boolean(config.ai.geminiApiKey),
      ollamaAi: ollamaStatus.connected ? "connected" : "offline",
    },
  });
});

// API Routes
app.use("/api", apiRouter);

// Centralized error handling
app.use(errorHandler);

// Start server and verify PostgreSQL
app.listen(config.port, async () => {
  console.log(`\n======================================================`);
  console.log(`👔 Daily Outfit Studio Backend running on port ${config.port}`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`❤️  Health check: http://localhost:${config.port}/health`);
  console.log(`📦 API Base: http://localhost:${config.port}/api`);
  console.log(`======================================================\n`);

  if (config.database.url) {
    const pg = await testPostgresConnection();
    if (pg.connected) {
      console.log(`🐘 PostgreSQL connected: ${pg.database || "default db"}`);
      await initializeDatabase();
    } else {
      console.warn(`⚠️ PostgreSQL connection warning: ${pg.error}`);
    }
  } else {
    console.log(`ℹ️  No DATABASE_URL configured yet. Running in development memory mode.`);
  }
});

export default app;

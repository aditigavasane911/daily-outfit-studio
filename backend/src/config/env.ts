import dotenv from "dotenv";
import path from "path";

// Load backend .env first, then fallback to root .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",

  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
  },

  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    ollamaEndpoint: process.env.OLLAMA_ENDPOINT || "http://127.0.0.1:11434",
    ollamaModel: process.env.OLLAMA_MODEL || "qwen2.5:3b",
  },
};

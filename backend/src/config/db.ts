import postgres from "postgres";
import { config } from "./env.js";

let sql: postgres.Sql | null = null;

export function getPostgresClient(): postgres.Sql | null {
  if (!config.database.url) {
    return null;
  }

  if (!sql) {
    const isRemote =
      config.database.url.includes("supabase.co") ||
      config.database.url.includes("neon.tech") ||
      config.database.url.includes("pooler") ||
      config.database.url.includes("railway.app") ||
      config.database.url.includes("render.com");

    sql = postgres(config.database.url, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
      ssl: isRemote ? { rejectUnauthorized: false } : false,
    });
  }

  return sql;
}

export async function testPostgresConnection(): Promise<{
  connected: boolean;
  version?: string;
  database?: string;
  error?: string;
}> {
  const client = getPostgresClient();
  if (!client) {
    return { connected: false, error: "DATABASE_URL or POSTGRES_URL is not set." };
  }

  try {
    const result = await client`SELECT version(), current_database() as database`;
    return {
      connected: true,
      version: result[0]?.version,
      database: result[0]?.database,
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Automatically creates tables and indexes if they don't exist yet in PostgreSQL
 */
export async function initializeDatabase(): Promise<void> {
  const client = getPostgresClient();
  if (!client) return;

  try {
    // 1. Extensions
    await client`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    // 2. Profiles Table
    await client`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT UNIQUE,
        sizes TEXT DEFAULT '',
        favorite_colors TEXT[] DEFAULT ARRAY['Midnight Spruce', 'Earthy Sage', 'Warm Sand', 'Flame Orange']::TEXT[],
        budget TEXT DEFAULT 'Under ₹3,000 per piece',
        style_note TEXT DEFAULT 'Quiet, earthy, easy to move in.',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    // 3. Garments Table
    await client`
      CREATE TABLE IF NOT EXISTS garments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'outerwear', 'shoes', 'accessories')),
        color_name TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        size TEXT DEFAULT '',
        brand TEXT,
        fabric TEXT,
        seasons TEXT[] DEFAULT '{}',
        formality TEXT DEFAULT 'casual' CHECK (formality IN ('casual', 'smart', 'formal')),
        image_url TEXT,
        favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    await client`CREATE INDEX IF NOT EXISTS idx_garments_user_id ON garments(user_id)`;
    await client`CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category)`;
    await client`CREATE INDEX IF NOT EXISTS idx_garments_favorite ON garments(favorite)`;

    // 4. Saved Outfits Table
    await client`
      CREATE TABLE IF NOT EXISTS saved_outfits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        score NUMERIC DEFAULT 0,
        reasons TEXT[] DEFAULT '{}',
        matched_palette_id INTEGER,
        piece_ids UUID[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    await client`CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id)`;

    console.log("✅ PostgreSQL schema verified and ready.");
  } catch (err) {
    console.warn("⚠️ Database auto-initialization notice:", err instanceof Error ? err.message : String(err));
  }
}

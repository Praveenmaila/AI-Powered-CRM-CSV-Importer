import { z } from "zod";
import dotenv from "dotenv";

// Load .env file before validation
dotenv.config();

// ═══════════════════════════════════════════════
// Environment Variable Schema
// ═══════════════════════════════════════════════

const envSchema = z.object({
  PORT: z
    .string()
    .default("8000")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(65535)),

  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required. Get one at https://aistudio.google.com/apikey"),

  GEMINI_MODEL: z
    .string()
    .default("gemini-2.0-flash"),

  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000"),

  BATCH_SIZE: z
    .string()
    .default("25")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(5).max(100)),

  MAX_RETRIES: z
    .string()
    .default("3")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(10)),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// ═══════════════════════════════════════════════
// Parse & Export
// ═══════════════════════════════════════════════

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const formatted = Object.entries(errors)
    .map(([key, msgs]) => `  ❌ ${key}: ${msgs?.join(", ")}`)
    .join("\n");

  console.error("\n╔══════════════════════════════════════════╗");
  console.error("║   Environment Variable Validation Failed  ║");
  console.error("╚══════════════════════════════════════════╝\n");
  console.error(formatted);
  console.error("\nCopy .env.example to .env and fill in the required values.\n");
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;

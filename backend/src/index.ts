import { env } from "./config/env";
import app from "./app";
import { logger } from "./utils/logger";

// ═══════════════════════════════════════════════
// AI CSV Importer — Backend Entry Point (v1.0.1)
// ═══════════════════════════════════════════════

const server = app.listen(env.PORT, () => {
  logger.info(`
╔══════════════════════════════════════════════╗
║   AI CSV Importer — Backend Server           ║
╠══════════════════════════════════════════════╣
║                                              ║
║   🚀 Server running on port ${String(env.PORT).padEnd(16)}  ║
║   📡 Health:  http://localhost:${env.PORT}/api/health  ║
║   🤖 Model:   ${env.GEMINI_MODEL.padEnd(27)}  ║
║   📦 Batch:   ${String(env.BATCH_SIZE).padEnd(27)}  ║
║   🔄 Retries: ${String(env.MAX_RETRIES).padEnd(27)}  ║
║   🌐 CORS:    ${env.CORS_ORIGIN.padEnd(27)}  ║
║                                              ║
╚══════════════════════════════════════════════╝
  `);
});

// ── Graceful Shutdown ─────────────────────────

function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ── Unhandled Errors ──────────────────────────

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
  process.exit(1);
});

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
// Trust the Replit/Vercel proxy (1 hop) so req.ip is correct behind reverse proxies
app.set("trust proxy", 1);

// ── Trusted origins ────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://officialum1.com",
  "https://www.officialum1.com",
  /\.replit\.dev$/,
  /\.replit\.app$/,
  /\.repl\.co$/,
  // local dev
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // same-origin / server-to-server
  return ALLOWED_ORIGINS.some(p => typeof p === "string" ? p === origin : p.test(origin));
}

// ── Security headers (helmet) ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.g2g.com", "https://officialum1.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) cb(null, true);
      else { logger.warn({ origin }, "CORS: blocked origin"); cb(new Error("CORS_BLOCKED")); }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Extension-Version"],
    maxAge: 86400,
  })
);

// ── Global rate limits ──────────────────────────────────────────────────────
// Tight limit on auth endpoint to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts — try again in 15 minutes" },
  skip: () => process.env.NODE_ENV !== "production",
});

// General API limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Rate limit exceeded" },
});

// Extension / webhook ingest — slightly looser
const extensionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// ── Request logging ─────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Remove sensitive headers ────────────────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.removeHeader("X-Powered-By");
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/admin/login", authLimiter);
app.use("/api/extension", extensionLimiter);
app.use("/api", apiLimiter, router);

// ── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message === "CORS_BLOCKED") {
    res.status(403).json({ error: "CORS: origin not allowed" });
    return;
  }
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;

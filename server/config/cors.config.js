const PRODUCTION_FRONTEND_URL = 'https://social-network-fronted.onrender.com';
const DEVELOPMENT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const DEFAULT_CLIENT_ORIGINS = [PRODUCTION_FRONTEND_URL, ...DEVELOPMENT_ORIGINS];

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getClientOrigins() {
  const fromEnv = parseOrigins(process.env.CLIENT_ORIGINS || process.env.CLIENT_URL);
  return fromEnv.length ? fromEnv : DEFAULT_CLIENT_ORIGINS;
}

function getClientUrl() {
  return (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    PRODUCTION_FRONTEND_URL
  );
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
}

function createCorsOptions(allowedOrigins = getClientOrigins()) {
  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

function createSocketCorsOptions(allowedOrigins = getClientOrigins()) {
  return {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  };
}

module.exports = {
  PRODUCTION_FRONTEND_URL,
  DEFAULT_CLIENT_ORIGINS,
  getClientOrigins,
  getClientUrl,
  createCorsOptions,
  createSocketCorsOptions,
};

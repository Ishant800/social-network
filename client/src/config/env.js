/** Live production URLs (Render) */
export const PRODUCTION_API_URL = 'https://social-network-backend-9gdm.onrender.com';
export const PRODUCTION_FRONTEND_URL = 'https://social-network-fronted.onrender.com';

/** Local development defaults */
export const DEVELOPMENT_API_URL = 'http://localhost:5000';
export const DEVELOPMENT_FRONTEND_URL = 'http://localhost:5173';

const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const envFrontendUrl = (import.meta.env.VITE_FRONTEND_URL || '').trim();

export const API_BASE_URL =
  envApiUrl || (import.meta.env.PROD ? PRODUCTION_API_URL : DEVELOPMENT_API_URL);

export const FRONTEND_BASE_URL =
  envFrontendUrl || (import.meta.env.PROD ? PRODUCTION_FRONTEND_URL : DEVELOPMENT_FRONTEND_URL);

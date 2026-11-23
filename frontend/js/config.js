// API base URL: local in development, Render in production.
// After deploying to Render, replace the production URL below.
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL = isLocalhost
    ? "http://localhost:3000"
    : "https://maintenance-system-api-ionx.onrender.com";

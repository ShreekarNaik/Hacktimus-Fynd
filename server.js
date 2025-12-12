// server/server.js (ESM)
import express from 'express';
import path, { dirname, resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Boltic typically provides PORT; default to 8080 to match container EXPOSE
const PORT = Number(process.env.PORT || 8080);

// Determine frontend build directory (default to Vite dist)
const frontendDir = process.env.REACT_BUILD_DIR
  ? resolve(__dirname, process.env.REACT_BUILD_DIR)
  : resolve(__dirname, '../client/dist');

// Serve static assets from the built client
app.use(express.static(frontendDir));

// Simple healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Example API route (adjust/extend as needed)
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Boltic server!' });
});

// SPA fallback: send index.html for all non-file GET requests
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (extname(req.path)) return next();
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(join(frontendDir, 'index.html'));
});

// Final 404 for non-matched routes (e.g., APIs with wrong method/path)
app.use((_req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

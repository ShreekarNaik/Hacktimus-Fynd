// server/server.js (ESM)
import express from "express";
import path, { dirname, resolve, join, extname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Boltic typically provides PORT; default to 8080 to match container EXPOSE
const PORT = Number(process.env.PORT || 8080);

import dotenv from "dotenv";
dotenv.config();

import express, { Response, Express, Request } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { FRONTEND_URL, NODE_ENV, PORT } from "./constants.js";

const app: Express = express();

interface CorsOptions {
  origin: (origin: undefined | string, callback: (err: Error | null, allow?: boolean) => void) => void;
  allowedHeaders: string[];
  credentials: boolean;
  methods: string[];
  maxAge: number;
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [FRONTEND_URL];

    if (allowedOrigins.includes(origin || "") || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

export default app;

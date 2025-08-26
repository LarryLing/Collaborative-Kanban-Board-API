import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Request, Response } from "express";

import { FRONTEND_URL, NODE_ENV, PORT } from "./constants.js";
import authRouter from "./routes/authRoutes.js";
import boardRouter from "./routes/boardRoutes.js";
import cardRouter from "./routes/cardRoutes.js";
import collaboratorRouter from "./routes/collaboratorRoutes.js";
import listRouter from "./routes/listRoutes.js";

const app: Express = express();

interface CorsOptions {
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  methods: string[];
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
}

const corsOptions: CorsOptions = {
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: (origin, callback) => {
    const allowedOrigins = [FRONTEND_URL];

    if (allowedOrigins.includes(origin || "") || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);
app.use("/api/lists", listRouter);
app.use("/api/cards", cardRouter);
app.use("/api/collaborators", collaboratorRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

export default app;

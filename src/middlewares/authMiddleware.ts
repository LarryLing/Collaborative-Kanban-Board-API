import { NextFunction } from "express";

import { AuthRequest, Response } from "../types.js";
import jwtVerifier from "../config/jwtVerifier.js";

export async function verifyAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Failed to verify auth: Authorization bearer not provided");

      res.status(401).json({
        error: "Authorization bearer not provided",
        message: "Failed to verify auth",
      });

      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.error("Failed to verify auth: Access token not provided in authorization bearer");

      res.status(401).json({
        error: "Access token not provided in authorization bearer",
        message: "Failed to verify auth",
      });

      return;
    }

    const payload = await jwtVerifier.verify(token);

    req.auth = {
      accessToken: token,
      id: payload.sub,
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to verify auth:", errorMessage);

    res.status(401).json({
      message: "Failed to verify auth",
      error: errorMessage,
    });
  }
}

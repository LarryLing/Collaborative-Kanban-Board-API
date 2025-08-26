import { Router } from "express";

import { createBoard, deleteBoard, getAllBoards, getBoardById, updateBoard } from "../controllers/boardControllers.js";
import { verifyAuth } from "../middlewares/authMiddleware.js";
import { verifyRole } from "../middlewares/collaboratorMiddleware.js";

const boardRouter: Router = Router();

boardRouter.get("/", verifyAuth, getAllBoards);
boardRouter.get("/:boardId", verifyAuth, verifyRole, getBoardById);
boardRouter.post("/", verifyAuth, createBoard);
boardRouter.patch("/:boardId", verifyAuth, verifyRole, updateBoard);
boardRouter.delete("/:boardId", verifyAuth, verifyRole, deleteBoard);

export default boardRouter;

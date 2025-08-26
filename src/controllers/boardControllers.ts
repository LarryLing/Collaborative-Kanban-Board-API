import { ResultSetHeader } from "mysql2/promise";

import db from "../config/db.js";
import { COLLABORATOR, OWNER } from "../constants.js";
import { AuthRequest, Board, CollaboratorRequest, CreateBoardBody, Response, UpdateBoardBody } from "../types.js";

export async function createBoard(req: AuthRequest<object, object, CreateBoardBody>, res: Response) {
  if (!req.auth) {
    console.error("Failed to create board: User is not authorized to make request");

    res.status(401).json({
      error: "User is not authorized to make request",
      message: "Failed to create board",
    });

    return;
  }

  const { id: owner_id } = req.auth;
  const { created_at, id, title } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await db.execute(
      `INSERT INTO boards (id, owner_id, title, created_at)
      VALUES (?, ?, ?, ?)`,
      [id, owner_id, title, created_at],
    );

    await db.execute(
      `INSERT INTO boards_collaborators (user_id, board_id, role, joined_at)
      VALUES (?, ?, ?, ?)`,
      [owner_id, id, OWNER, created_at],
    );

    await connection.commit();
    res.status(201).json({ message: "Successfully created board" });
  } catch (error) {
    await connection.rollback();

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to create board:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to create board",
    });
  } finally {
    connection.release();
  }
}

export async function deleteBoard(req: CollaboratorRequest<{ boardId: string }>, res: Response) {
  if (!req.auth) {
    console.error("Failed to delete board: User is not authorized to make request");

    res.status(401).json({
      error: "User is not authorized to make request",
      message: "Failed to delete board",
    });

    return;
  }

  if (!req.role) {
    console.error("Failed to delete board: User is not a board owner or collaborator");

    res.status(401).json({
      error: "User is not a board owner or collaborator",
      message: "Failed to delete board",
    });

    return;
  }

  const { id } = req.auth;
  const role = req.role;
  const { boardId } = req.params;

  if (role === COLLABORATOR) {
    console.error("Failed to delete board: Cannot delete board as a collaborator");

    res.status(403).json({
      error: "Cannot delete board as a collaborator",
      message: "Failed to delete board",
    });

    return;
  }

  try {
    await db.execute<ResultSetHeader>(
      `DELETE FROM boards
      WHERE id = ? AND owner_id = ?`,
      [boardId, id],
    );

    res.status(200).json({ message: "Successfully deleted board" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to delete board:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to delete board",
    });
  }
}

export async function getAllBoards(req: AuthRequest, res: Response) {
  if (!req.auth) {
    console.error("Failed to retrieve boards: User is not authorized to make request");

    res.status(401).json({
      error: "User is not authorized to make request",
      message: "Failed to retrieve boards",
    });

    return;
  }

  const { id } = req.auth;

  try {
    const [rows] = await db.execute(
      `SELECT b.*
      FROM boards b
      INNER JOIN boards_collaborators bc ON b.id = bc.board_id
      WHERE bc.user_id = ?
      ORDER BY b.created_at DESC`,
      [id],
    );

    res.status(200).json({
      data: rows as Board[],
      message: "Successfully retrieved boards",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to retrieve boards:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to retrieve boards",
    });
  }
}

export async function getBoardById(req: AuthRequest<{ boardId: Board["id"] }>, res: Response) {
  if (!req.auth) {
    console.error("Failed to retrieve board: User is not authorized to make request");

    res.status(401).json({
      error: "User is not authorized to make request",
      message: "Failed to retrieve board",
    });

    return;
  }

  const { id } = req.auth;
  const { boardId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT b.*
      FROM boards b
      INNER JOIN boards_collaborators bc ON b.id = bc.board_id
      WHERE bc.user_id = ? AND bc.board_id = ?
      LIMIT 1`,
      [id, boardId],
    );

    if (!rows || (rows as Board[]).length === 0) {
      console.error("Failed to retrieve board: Could not find board in database");

      res.status(404).json({
        error: "Could not find board in database",
        message: "Failed to retrieve board",
      });

      return;
    }

    res.status(200).json({
      data: (rows as Board[])[0],
      message: "Successfully retrieved board",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to retrieve board:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to retrieve board",
    });
  }
}

export async function updateBoard(
  req: CollaboratorRequest<{ boardId: Board["id"] }, object, UpdateBoardBody>,
  res: Response,
) {
  if (!req.auth) {
    console.error("Failed to update board: User is not authorized to make request");

    res.status(401).json({
      error: "User is not authorized to make request",
      message: "Failed to update board",
    });

    return;
  }

  const { id } = req.auth;
  const { boardId } = req.params;
  const { title } = req.body;

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE boards b
      INNER JOIN boards_collaborators bc ON b.id = bc.board_id
      SET b.title = ?
      WHERE bc.user_id = ? AND bc.board_id = ?`,
      [title, id, boardId],
    );

    if (result.affectedRows === 0) {
      console.error("Failed to update board: Could not find board in database");

      res.status(404).json({
        error: "Could not find board in database",
        message: "Failed to update board",
      });

      return;
    }

    res.status(200).json({ message: "Successfully updated board" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to update board:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to update board",
    });
  }
}

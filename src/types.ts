import { Request, Response } from "express";
import { JwtPayload } from "jwt-decode";

import { COLLABORATOR, OWNER } from "./constants.js";

export type AddCollaboratorBody = Pick<User, "email">;

export interface AuthRequest<P = never, ResBody = never, ReqBody = never> extends Request<P, ResBody, ReqBody> {
  auth?: {
    accessToken: string;
    id: User["id"];
  };
}

export interface Board {
  created_at: string;
  id: string;
  owner_id: string;
  title: string;
}

export type { Response };

export interface Card {
  board_id: string;
  description: string;
  id: string;
  list_id: string;
  position: string;
  title: string;
}

export type Collaborator = User & {
  joined_at: string;
  role: typeof COLLABORATOR | typeof OWNER;
};
export interface CollaboratorRequest<P = never, ResBody = never, ReqBody = never>
  extends AuthRequest<P, ResBody, ReqBody> {
  role?: Collaborator["role"];
}
export type ConfirmSignUpBody = Pick<User, "email"> & {
  confirmationCode: string;
};
export type CreateBoardBody = Pick<Board, "created_at" | "id" | "title">;
export type CreateCardBody = Pick<Card, "description" | "id" | "position" | "title">;

export type CreateListBody = Pick<List, "id" | "position" | "title">;

export interface IDTokenPayload extends JwtPayload {
  email: string;
  family_name: string;
  given_name: string;
}
export interface List {
  board_id: string;
  id: string;
  position: string;
  title: string;
}

export type LoginBody = Pick<User, "email"> & { password: string };

export type PasswordResetBody = Pick<User, "email"> & {
  confirmationCode: string;
  password: string;
};

export type RequestConfirmationCode = Pick<User, "email">;

export type SignUpBody = Pick<User, "email" | "family_name" | "given_name"> & {
  password: string;
};
export type UpdateBoardBody = Pick<Board, "title">;
export type UpdateCardBody = Pick<Card, "description" | "title">;

export type UpdateCardPositionBody = Pick<Card, "position"> & { newListId: List["id"] };

export type UpdateListBody = Pick<List, "title">;
export type UpdateListPositionBody = Pick<List, "position">;
export interface User {
  email: string;
  family_name: string;
  given_name: string;
  id: string;
}

import { Response, Request } from "express";
import { JwtPayload } from "jwt-decode";

import { COLLABORATOR, OWNER } from "./constants.js";

export interface AuthRequest<P = never, ResBody = never, ReqBody = never> extends Request<P, ResBody, ReqBody> {
  auth?: {
    accessToken: string;
    id: User["id"];
  };
}

export interface CollaboratorRequest<P = never, ResBody = never, ReqBody = never>
  extends AuthRequest<P, ResBody, ReqBody> {
  role?: Collaborator["role"];
}

export interface Card {
  description: string;
  board_id: string;
  position: string;
  list_id: string;
  title: string;
  id: string;
}

export type { Response };

export interface IDTokenPayload extends JwtPayload {
  family_name: string;
  given_name: string;
  email: string;
}

export type PasswordResetBody = {
  confirmationCode: string;
  password: string;
} & Pick<User, "email">;
export type Collaborator = {
  role: typeof COLLABORATOR | typeof OWNER;
  joined_at: string;
} & User;
export type SignUpBody = Pick<User, "family_name" | "given_name" | "email"> & {
  password: string;
};
export interface User {
  family_name: string;
  given_name: string;
  email: string;
  id: string;
}
export interface Board {
  created_at: string;
  owner_id: string;
  title: string;
  id: string;
}

export interface List {
  board_id: string;
  position: string;
  title: string;
  id: string;
}

export type UpdateCardPositionBody = { newListId: List["id"] } & Pick<Card, "position">;
export type ConfirmSignUpBody = {
  confirmationCode: string;
} & Pick<User, "email">;

export type CreateCardBody = Pick<Card, "description" | "position" | "title" | "id">;

export type CreateBoardBody = Pick<Board, "created_at" | "title" | "id">;

export type CreateListBody = Pick<List, "position" | "title" | "id">;

export type LoginBody = { password: string } & Pick<User, "email">;
export type UpdateCardBody = Pick<Card, "description" | "title">;
export type UpdateListPositionBody = Pick<List, "position">;

export type RequestConfirmationCode = Pick<User, "email">;

export type AddCollaboratorBody = Pick<User, "email">;
export type UpdateBoardBody = Pick<Board, "title">;
export type UpdateListBody = Pick<List, "title">;

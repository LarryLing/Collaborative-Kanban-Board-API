import {
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  AdminUserGlobalSignOutCommand,
  AuthFlowType,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GetTokensFromRefreshTokenCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Request } from "express";
import { jwtDecode } from "jwt-decode";
import { RowDataPacket } from "mysql2/promise";

import cognito from "../config/cognito.js";
import db from "../config/db.js";
import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } from "../constants.js";
import {
  AuthRequest,
  ConfirmSignUpBody,
  IDTokenPayload,
  LoginBody,
  PasswordResetBody,
  RequestConfirmationCode,
  Response,
  SignUpBody,
} from "../types.js";

export async function confirmSignUp(req: Request<object, object, ConfirmSignUpBody>, res: Response) {
  try {
    const { confirmationCode, email } = req.body;

    const confirmSignUpCommand = new ConfirmSignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      ConfirmationCode: confirmationCode,
      Username: email,
    });

    await cognito.send(confirmSignUpCommand);

    res.status(200).json({ message: "Successfully confirmed sign up" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to confirm sign up:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to confirm sign up",
    });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    if (!req.auth) {
      console.error("Failed to delete user: User is not authorized to make request");

      res.status(401).json({
        error: "User is not authorized to make request",
        message: "Failed to delete user",
      });

      return;
    }

    const { id } = req.auth;

    const adminDeleteUserCommand = new AdminDeleteUserCommand({
      Username: id,
      UserPoolId: COGNITO_USER_POOL_ID,
    });

    await cognito.send(adminDeleteUserCommand);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ message: "Successfully deleted user" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to delete user:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to delete user",
    });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.auth) {
      console.error("Failed to get user: User is not authorized to make request");

      res.status(401).json({
        error: "User is not authorized to make request",
        message: "Failed to get user",
      });

      return;
    }

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.error("Failed to get user: Refresh token not found in cookies");

      res.status(401).json({
        error: "Refresh token not found in cookies",
        message: "Failed to get user",
      });

      return;
    }

    const getTokensFromRefreshTokenCommand = new GetTokensFromRefreshTokenCommand({
      ClientId: COGNITO_CLIENT_ID,
      RefreshToken: refreshToken,
    });

    const getTokensFromRefreshTokenResponse = await cognito.send(getTokensFromRefreshTokenCommand);

    if (!getTokensFromRefreshTokenResponse.AuthenticationResult) {
      throw new Error("Could not regenerate tokens with the provided refresh token");
    }

    const { AccessToken, IdToken, RefreshToken } = getTokensFromRefreshTokenResponse.AuthenticationResult;

    if (!IdToken || !AccessToken || !RefreshToken) {
      throw new Error("User pool tokens were not generated");
    }

    res.cookie("refreshToken", RefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none", // Required for cross-origin cookies
      secure: true,
    });

    res.status(200).json({
      data: {
        accessToken: AccessToken,
        idToken: IdToken,
      },
      message: "Successfully regenerated tokens",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to get user:", errorMessage);

    res.status(401).json({
      error: errorMessage,
      message: "Failed to get user",
    });
  }
}

export async function login(req: Request<object, object, LoginBody>, res: Response) {
  try {
    const { email, password } = req.body;

    const adminInitiateAuthCommand = new AdminInitiateAuthCommand({
      AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
      AuthParameters: {
        PASSWORD: password,
        USERNAME: email,
      },
      ClientId: COGNITO_CLIENT_ID,
      UserPoolId: COGNITO_USER_POOL_ID,
    });

    const adminInitiateAuthResponse = await cognito.send(adminInitiateAuthCommand);

    if (!adminInitiateAuthResponse.AuthenticationResult) {
      throw new Error("Authentication failed");
    }

    const { AccessToken, IdToken, RefreshToken } = adminInitiateAuthResponse.AuthenticationResult;

    if (!IdToken || !AccessToken || !RefreshToken) {
      throw new Error("User pool tokens were not generated");
    }

    const { email: userEmail, family_name, given_name, sub } = jwtDecode<IDTokenPayload>(IdToken);

    const [userRows] = await db.execute<RowDataPacket[]>(
      `SELECT *
      FROM users
      WHERE id = ?
      LIMIT 1`,
      [sub],
    );

    if (!userRows || userRows.length === 0) {
      const now = new Date();
      const currentTimestamp = now.toISOString().slice(0, 19).replace("T", " ");

      await db.execute(
        `INSERT INTO users (id, given_name, family_name, email, created_at)
        VALUES (?, ?, ?, ?, ?)`,
        [sub, given_name, family_name, userEmail, currentTimestamp],
      );
    }

    res.cookie("refreshToken", RefreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({
      data: {
        accessToken: AccessToken,
        idToken: IdToken,
      },
      message: "Successfully logged in returning user",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to login returning user:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to login returning user",
    });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  try {
    if (!req.auth) {
      console.error("Failed to logout user: User is not authorized to make request");

      res.status(401).json({
        error: "User is not authorized to make request",
        message: "Failed to logout user",
      });

      return;
    }

    const { id } = req.auth;

    const adminUserGlobalSignOutCommand = new AdminUserGlobalSignOutCommand({
      Username: id,
      UserPoolId: COGNITO_USER_POOL_ID,
    });

    await cognito.send(adminUserGlobalSignOutCommand);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ message: "Successfully logged out user" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to logout user:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to logout user",
    });
  }
}

export async function requestPasswordReset(req: AuthRequest<object, object, RequestConfirmationCode>, res: Response) {
  try {
    const { email } = req.body;

    const forgotPasswordCommand = new ForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognito.send(forgotPasswordCommand);

    res.status(200).json({ message: "Successfully requested password reset" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to request password reset:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to request password reset",
    });
  }
}

export async function resendSignUp(req: Request<object, object, RequestConfirmationCode>, res: Response) {
  try {
    const { email } = req.body;

    const resendConfirmationCodeCommand = new ResendConfirmationCodeCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognito.send(resendConfirmationCodeCommand);

    res.status(200).json({ message: "Successfully resent sign up confirmation code" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to resend sign up confirmation code:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to resend sign up confirmation code",
    });
  }
}

export async function resetPassword(req: Request<object, object, PasswordResetBody>, res: Response) {
  try {
    const { confirmationCode, email, password } = req.body;

    const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      ConfirmationCode: confirmationCode,
      Password: password,
      Username: email,
    });

    await cognito.send(confirmForgotPasswordCommand);

    res.status(200).json({ message: "Successfully reset password" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to reset password:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to reset password",
    });
  }
}

export async function signUp(req: Request<object, object, SignUpBody>, res: Response) {
  try {
    const { email, family_name, given_name, password } = req.body;

    const signUpCommand = new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Password: password,
      UserAttributes: [
        {
          Name: "given_name",
          Value: given_name,
        },
        {
          Name: "family_name",
          Value: family_name,
        },
        {
          Name: "email",
          Value: email,
        },
      ],
      Username: email,
    });

    await cognito.send(signUpCommand);

    const now = new Date();
    const currentTimestamp = now.toISOString().slice(0, 19).replace("T", " ");

    await db.execute(
      `INSERT INTO users (id, given_name, family_name, email, created_at)
      VALUES (?, ?, ?, ?, ?)`,
      [email, given_name, family_name, email, currentTimestamp],
    );

    res.status(201).json({ message: "Successfully signed up new user" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Failed to sign up new user:", errorMessage);

    res.status(500).json({
      error: errorMessage,
      message: "Failed to sign up new user",
    });
  }
}

import type { Request, Response } from "express";
import authService from "../services/auth.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { signToken } from "../../utils/jwt.js";


export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    //id: number;
    //name: string;
    //email: string;
    //role: "contributor" | " maintainer";
    //created_at: Date;
    //updated_at: Date;
    const { name, email, password, role,  } = req.body;
    const user = await authService.createUser({ name, email, password, role, });

    if (!user) {
      return sendResponse(res, { message: "Failed to create user", error: true }, 400);
    }

    sendResponse(res, { message: "User registered successfully", data: user }, 200);
  } catch (error: any) {
    console.error("Signup error:", error);
    
    
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return sendResponse(res, { message: "Email already exists", error: true }, 400);
    }
    
    sendResponse(res, { message: "Internal server error", error: true }, 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, { message: "Email and password are required", error: true }, 400);
    }

    const user = await authService.loginUser(email, password);

    if (!user) {
      return sendResponse(res, { message: "Invalid email or password", error: true }, 401);
    }

    // Create JWT payload with id, name, and role
    const tokenPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const { accessToken, refresToken } = signToken(tokenPayload as any);

    sendResponse(
      res,
      {
        message: "Login successful",
        data: {
          token: accessToken,
          refreshToken: refresToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      },
      200
    );
  } catch (error: any) {
    console.error("Login error:", error);
    sendResponse(res, { message: "Internal server error", error: true }, 500);
  }
};
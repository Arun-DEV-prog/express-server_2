import type { Request, Response } from "express";
import authService from "../services/auth.service";
import { sendResponse } from "../../utils/sendResponse";


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
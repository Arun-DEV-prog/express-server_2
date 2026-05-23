import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse.js";
import { verifyToken } from "../utils/jwt.js";

import type { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const auth=async(req: Request, res: Response, next: NextFunction)=>{
    try{

        const token= req.headers.authorization;
        if(!token){
             return sendResponse(res,{message: "Access token missing",error: true}, 401)
        }

        const payload:JwtPayload=verifyToken(token,"access");

        if(!payload){
             return sendResponse(res, { message: "Invalid access token", error: true }, 401);
        }

        req.user = payload;
        next();

    }catch(error: any){
        next(error)
         
    }
}
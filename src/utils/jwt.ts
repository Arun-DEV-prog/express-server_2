import { config } from "../config/config.js"
import jwt, { type JwtPayload } from "jsonwebtoken"
import type { RUser } from "../types/index.js";

export const verifyToken=(token: string, type: "access" | "refress")=>{
     const secret= type==="refress" ? config.refres_token_secret : config.access_token_secret;
     const decoded= jwt.verify(token, secret) as JwtPayload
     return decoded;
}



export const signToken=(payload: RUser)=>{
     const accessToken=jwt.sign(payload, config.access_token_secret,{
        expiresIn:"1h"
     })

    const refresToken= jwt.sign(payload, config.refres_token_secret,{
        expiresIn: "7d"
    })

    return {accessToken, refresToken}
}


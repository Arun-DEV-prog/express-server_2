
 import dotenv from "dotenv";
dotenv.config({quiet: true});

export const config={
     port: process.env.PORT || 5000,
     node_env:process.env.NODE_ENV as string,
     database_url:process.env.DATABASE_URL as string,
     access_token_secret: process.env.JWT_SECRET as string,
     refres_token_secret: process.env.JWT_SECRET as string

 }

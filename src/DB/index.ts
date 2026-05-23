import { neon } from "@neondatabase/serverless";
import { config } from "../config/config.js";
import { createSchema } from "./schema.js";

export const sql=neon(config.database_url)

export const initDB= async()=>{
      await  createSchema();
    console.log("Database connected successfully!")
}
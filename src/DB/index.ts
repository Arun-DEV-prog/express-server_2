import { neon } from "@neondatabase/serverless";
import { config } from "../config/config.js";
import { createSchema } from "./schema.js";

export const sql=neon(config.database_url)

// Track schema creation to avoid redundant operations
let schemaCreated = false;

export const initDB= async()=>{
  if (schemaCreated) {
    console.log("Database already initialized");
    return;
  }
  
  try {
    await createSchema();
    schemaCreated = true;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Don't throw - let the first request fail with proper error message
    schemaCreated = false;
  }
}
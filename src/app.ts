import express, { type Application } from "express"
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application =express()

app.use(express.json());





app.use(globalErrorHandler)




export default app;
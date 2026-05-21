
import express, { type Application, type Request, type Response } from "express"
import globalErrorHandler from "./middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import authRoutes from  "./api/routes/auth.route"
const app: Application =express()

app.use(express.json());
app.use(cookieParser());
app.get("/", (req: Request, res:Response)=>{
    res.send("Server is Running")
})


app.use("/api/auth", authRoutes)


app.use(globalErrorHandler)




export default app;
import cors from "cors"
import cookieParser from "cookie-parser";
import express from "express"
const app = express()

app.use(cors({
    origin:process.env.CORS,
    credentials: true

}))



export default app;
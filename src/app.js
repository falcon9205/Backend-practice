import cors from "cors"
import cookieParser from "cookie-parser";
import express from "express"

const app = express()

app.use(cors({
    origin:process.env.CORS,
    credentials: true

}))

app.use(express.json({
    limit: "20kb"
}))

app.use(express.urlencoded({
    extended : true,
    limit : "20kb"
}))


app.use(express.static("public"))

app.use(cookieParser())

import userRouter from "./routes/user.routes.js"

app.use("/users",userRouter)



export default app;
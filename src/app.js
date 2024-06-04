import cors from "cors"
import cookieParser from "cookie-parser";
import express from "express"
import userRouter from "./routes/user.routes.js"

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



app.use("/users",userRouter)

app.use("/",userRouter)



export default app;
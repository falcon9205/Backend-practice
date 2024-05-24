import cors from "cors"
import cookieParser from "cookie-parser";
import express, { json } from "express"

const app = express()

app.use(cors({
    origin:process.env.CORS,
    credentials: true

}))

app.use(express,json({
    limit: "20kb"
}))

app.use(express.urlencoded({
    extended : true,
    limit : "20kb"
}))


app.use(express.static("public"))

app.use(cookieParser())
// app.listen(process.env.PORT, function(err){
//     if (err) console.log("Error in server setup")
//     console.log("Server listening on Port", PORT);
// })
//importing routes
import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users",userRouter)



export default app;
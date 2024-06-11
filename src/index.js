// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
// import mongoose from "mongoose";
import connectdb from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path:'./env'
})
connectdb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server listing at : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("error occured ",error);
})

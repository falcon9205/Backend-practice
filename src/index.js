// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
// import mongoose from "mongoose";
import connectdb from "./db/index.js";

dotenv.config({
    path:'./env'
})
connectdb()

// import express from "express"
// const app = express()

// (async()=>{
//    try{
//     await mongoose.connect(process.env.DB_URL)
//     app.on("error",(error)=>{
//         console.log("error",error);
//         throw error
//     })
//     app.listen(process.env.PORT,()=>{
//         console.log("listing at ",PORT);
//     })
//    } catch(error){
//     console.log("error");
//     throw err
//    }
// })()
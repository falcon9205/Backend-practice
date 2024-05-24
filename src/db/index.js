import mongoose from "mongoose";
// import express from "express"

const connectdb = async()=>{
   try{
    const connnectioninstance  = await mongoose.connect(process.env.DB_URL)
     console.log(`MongoDB connected !! DB Host : ${connnectioninstance.connection.host}`);
     console.log("server running at ",process.env.PORT);
   }
   catch(error){
    console.log("Error occured ",error);
    process.exit(1);
   }
}
export default connectdb;
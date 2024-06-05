import mongoose, { mongo } from "mongoose";
const SubscriptionSchema = new mongoose.Schema({
  subscriber : {
    type : Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",SubscriptionSchema)
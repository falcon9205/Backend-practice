import {asyncHandler} from "../utils/asyncHandler.js"
import Apierror from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import { uploadCloudinary } from "../utils/Cloudinary.js"

const registerUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message: "ok"
    })
    //get user from frontend
    //validation - not empty
    //check if user already exist
    //check for images - check for avatar
    //upload them to cloudinary , check avatar
    //create user object - create entry in db
    //remove password and refreshtoken field from response
    //check for user creation
    //return response 
    const {fullname,email,username,password} = req.body
    console.log(fullname,email,username,password);

    if([fullname,email.username,password].some((field)=>
      field?.trim() === ""
    ) )
       { throw new Apierror(400,"field required")
}
 const existeduser =  User.findOne({
    $or:[{email} , {username}]
  })
  if(existeduser)
      throw new Apierror(409,"already user exist")
   
  const avatarLocalPath = req.files ?.avatar[0]?.path
  const coverImageLocalPath= req.files ?.coverImage[0]?.path

  if(!avatarLocalPath)
    throw new Apierror(400,"need avatar")
  
  const avatar = await uploadCloudinary(avatarLocalPath)
  const coverImage = await uploadCloudinary(coverImageLocalPath)
  

})

export {registerUser}
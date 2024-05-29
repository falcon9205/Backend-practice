import { asyncHandler } from "../utils/asyncHandler.js";
import Apierror from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userid)=>{
  try{
        const user = await User.findById(userid)
       const accesstoken =  user.generateAccessToken()
       const refreshtoken = user.generateRefreshToken()
       user.refreshtoken = refreshtoken
       await user.save({validateBeforeSave: false})

       return {accesstoken,refreshtoken}

  } catch(error){
    throw new Apierror(500,"failed to generate tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user from frontend
  //validation - not empty
  //check if user already exist
  //check for images - check for avatar
  //upload them to cloudinary , check avatar
  //create user object - create entry in db
  //remove password and refreshtoken field from response
  //check for user creation
  //return response

  const { fullname, email, username, password } = req.body;
  

  if (
    [fullname, email.username, password].some((field) => field?.trim() === "")
  ) {
    throw new Apierror(400, "field required");
  }
  const existeduser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existeduser) {
    throw new Apierror(409, "alreadi user exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath = ""
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
     {
       coverImageLocalPath = req.files.coverImage[0].path
     }

  if (!avatarLocalPath) {
    throw new Apierror(400, "need avatar");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar)
    { throw new Apierror(400, "need avatar");
}

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createduser)
   {
    throw new Apierror(500, "something went wrong while registering the user");
   }

  return res.status(201).json({
    new: new ApiResponse(200, createduser, "User registered successfully"),
  });
});

const loginUser = asyncHandler(async (req,res)=>{
  //get data from req body
  // authenticate username or email
  // find the user in DB
  // password check
  // access and refresh token
  // send cookie

  const {username,password,email} = req.body

  if(!username || !email)
    throw new Apierror(400,"username or password is required")

  const user =await User.findOne({
    $or:[{username},{email}]
  })
  
  if(!user)
     throw new Apierror(404,"user not found")

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid)
     throw new ApiResponse(401,"password incorrect")

  const {accesstoken,refreshtoken} =await generateAccessAndRefreshToken(user._id)

})

export { registerUser , loginUser };

import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accesstoken = await user.generateAccessToken();

    const refreshtoken = user.generateRefreshToken();
    user.refreshtoken = refreshtoken;
    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(500, "failed to generate tokens");
  }
};

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
    throw new ApiError(400, "field required");
  }
  const existeduser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existeduser) {
    throw new ApiError(409, "already user exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath = "";
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "need avatar");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "need avatar");
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
  if (!createduser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res.status(201).json({
    new: new ApiResponse(200, createduser, "User registered successfully"),
  });
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from req body
  // authenticate username or email
  // find the user in DB
  // password check
  // access and refresh token
  // send cookie

  const { username, password, email } = req.body;

  if (!username && !email)
    throw new ApiError(400, "username or password is required");

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(404, "user not found");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiResponse(401, "password incorrect");

  const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(
    user._id
  );

  const logedinuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedinuser,
          accesstoken,
          refreshtoken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) throw new ApiError(401, "invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token expired or used");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookes("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "invalid password");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "password changed"));
});

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) throw new ApiError(400, "all fields are required");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

  const avatar = await uploadCloudinary(avatarLocalPath);

  if (!avatar.url) throw new ApiError(400, "Error while uploading on avatar");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .send(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath)
    throw new ApiError(400, "cover image file is missing");

  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading on cover image");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .send(200)
    .json(new ApiResponse(200, user, "updated cover image successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) throw new ApiError(400, "username is missing");
  const channel = await User.aggregate([
    //aggregation pipelines
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscriber.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) throw new ApiError(400, "channel does not exist");

  return res.status(200).json({
    new: new ApiResponse(200, channel[0], "User Channel fetched successfully"),
  });
});

const testing = asyncHandler(async (req, res) => {
  return res.json({
    new: new ApiResponse(200, {}, "Access Token refreshed successfully"),
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  testing,
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile
};

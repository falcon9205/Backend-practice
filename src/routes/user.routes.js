import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  testing,
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile
} from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshToken").post(refreshAccessToken)

router.route("/changepassword").post(verifyJWT,changeCurrentPassword)

router.route("/currentuser").get(verifyJWT,currentUser)

router.route("/updateaccount").patch(verifyJWT,updateAccountDetails)

router.route("/avatarupdate").patch(verifyJWT,upload.single("avatar"),updateAvatar)

router.route("/coverimageupdate").patch(verifyJWT,upload.single("coverimage"),updateCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/panda").post(testing) //testing matter

export default router;

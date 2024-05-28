// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs"
          
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

// const uploadCloudinary = async (localfilepath)=>{
//     try{
//         if(!localfilepath)
//              return null;
//       const res =  await cloudinary.uploader.upload(localfilepath, {
//             resource_type:"auto"
//         })    
//         console.log("successfully file uploaded on cloudinary",res);
//         fs.unlinkSync(localfilepath)
//         return res;
//     } catch (error){
//          fs.unlinkSync(localfilepath)  //removed local saved temporary file
//          return null;
//     }
// }

// export {uploadCloudinary};
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("Invalid or non-existent file path provided");
            return null;
        }

        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Successfully uploaded file to Cloudinary:", res);

        fs.unlinkSync(localFilePath);
        console.log("Local file deleted:", localFilePath);

        return res;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Local file deleted:", localFilePath);
        }

        return null;
    }
};

export { uploadCloudinary };

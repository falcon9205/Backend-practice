import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadCloudinary = async (localfilepath)=>{
    try{
        if(!localfilepath)
             return null;
      const res =  await cloudinary.uploader.upload(localfilepath, {
            resource_type:"auto"
        })    
        console.log("successfully file uploaded on cloudinary",res.url);
        return res;
    } catch (error){
         fs.unlinkSync(localfilepath)  //removed local saved temporary file
         return null;
    }
}

export default uploadCloudinary;
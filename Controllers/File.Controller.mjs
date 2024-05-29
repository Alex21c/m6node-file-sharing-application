import { throwNewError } from "../utils/utils.mjs";
import fs from "fs";
import path from "path";
import {v2 as cloudinary} from 'cloudinary';
import 'dotenv/config';
import FileModel from "../Models/File.Model.mjs";

// Configuration
  cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
  });

async function clodinaryFileUpload(req, cloudinary){
  // console.log(req.file.mimetype.startsWith('image')? "image" : "raw");
  // return ;
  try {    
    // actually i have to specify type of file, for non image files its raw
     let response = await cloudinary.uploader.upload(req.file.path, {resource_type: req.file.mimetype.startsWith('image')? "image" : "raw"});
    // console.log(response);
    if(!response){
      next(throwNewError(500, {success:false, message: "Failed to upload file to the Cloudinary Server!"}));
      return;
    }  

    // here we got the secure url for the file
      return response;
      
  } catch (error) {
    console.log(error);
    throw error;
  } 
}

const uploadFile = async (req, res, next)=>{
  try {    
    // here is the full path 
    

    // first check does it contains the file in the req.body ?
    console.log(req.file);
    // checking file size is it greater than 5MB
      if(req.file.size > 5000000){
        next(throwNewError(400, {success: false, message: "File size should be less than 5MB"}));
        return;
      }
  
  
    const cloudinaryResponse = await clodinaryFileUpload(req, cloudinary, next);
    // console.log(req.userID);
    const shareableLink = "HOSTNAME/api/v1/file/download-file/" +  cloudinaryResponse.public_id;
    const jsonObj = {
      fileName : req.file.originalname,      
      fileDownloadLink : cloudinaryResponse.secure_url,
      fileUniqueID : cloudinaryResponse.public_id,
      fileTrackableShareableLink : shareableLink,
      uploadedOnTimeStamp : new Date(),
      uploadedByWhichUser : req.userID,
      traffic : 0,      
    }
    // console.log(jsonObj);

    // creating new doc in DB
      const doc = new FileModel(jsonObj);
      doc.save();

    // Responding
    res.status(201).json({
      success: true, 
      message: "File Uploaded Successfully !",
      shareableLink : shareableLink
    });

  } catch (error) {
    next(throwNewError(500, {success: false, message: error.message}));
    return;
  }finally{
    // delete the flie
    
    // console.log(filePath);
    // delete file after 5 seconds

      setTimeout(()=>{          
          fs.unlinkSync(req.file.path);
          // fs.unlink();
        },5000);
  }

}

const getAllTheFilesUploadedByCurrentUser = async (req, res, next)=>{
  // query the mongodb asking get all the docs uploaded by current User
  const result = await FileModel.find({uploadedByWhichUser: req.userID});
  if(result.length === 0){
    next(throwNewError(404, {success: false, message: "No records Found!"}));
    return;
  }
  // return the result
  // console.log(result);
  res.json(result);  
}

const getFileForDownload = async (req, res, next)=>{
  try {
    const {fileUniqueID} = req.params;
    
    if(!fileUniqueID){
      next(throwNewError(400, {success: false, message: "required file Unique ID inside url parameters."}));
      return;
    }

    // query the database, ask to get a document whose fileUniqueID is matching, and uploaded by current user    
    const result = await FileModel.findOne({ fileUniqueID: fileUniqueID});



    if(result.length === 0){
      next(throwNewError(404, {success: false, message: "No records Found!"}));
      return;
    }
    // increase the traffic count
      result.traffic = result.traffic +1;
      result.save();
      
  // return the result  
    // res.json(result);  
    res.redirect(result.fileDownloadLink);
    
  } catch (error) {
    next(throwNewError(500, {success:false, message: "Something went wrong! unable to provide file downlod."}));    
  }
}

const FileController = {
  uploadFile,
  getAllTheFilesUploadedByCurrentUser,
  getFileForDownload
};

export default FileController;

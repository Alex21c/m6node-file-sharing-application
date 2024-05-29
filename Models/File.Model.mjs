import mongoose from "mongoose";
const {Schema} = mongoose;
/**
 * 
 * SCHEMA for shortURLS?
 * {
 *
 * fileName : String the actual name of the file while uploaded
 * fileExtension : String file extension
 * fileDownloadLink: String containing clodinary server location for given file
 * fileUniqueID : String 12 letters unique id for file, helpful in tracking
 * fileTrackableShareableLink : String URL pointing to the backend server, which will count the traffic and then redirect to the clodinary link
 * uploadedOnTimeStamp : String timestamp of file upload 
 * uploadedByWhichUser : String ID of user who uploaded it
 * traffic: Number total no visitors opened the download link for this file 
 * }
 */
const FileSchema = new Schema({
  fileName : {type: String, required: true},  
  fileDownloadLink : {type: String, required: true},
  fileUniqueID : {type: String, required: true},
  fileTrackableShareableLink : {type: String, required: true},
  uploadedOnTimeStamp : {type: Date, required: true},
  uploadedByWhichUser : {type: String, required: true},
  traffic : {type: Number, required: true, default: 0},

});

// Here i'm specifying the my collection name and schema to be followed by all the documents inside it
const FileModel = mongoose.model('Files', FileSchema);
export default FileModel;
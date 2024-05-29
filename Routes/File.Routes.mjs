import FileController from "../Controllers/File.Controller.mjs";
import e from 'express';
import multer from "multer";
import { nanoid } from "nanoid";
import AuthenticateUser from "../Middlewares/AuthenticateUser.Middleware.mjs";
const storage = multer.diskStorage(
  {

    destination: function (req, file, cb){
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb){
      const newFileName = nanoid(21) +"."+ file.originalname.split('.').at(-1);
      // const newFileName = req.file.originalname;

      // console.log(newFileName)
      cb(null, newFileName)
    }
  }
);
const upload = multer({storage: storage});

const FileRoutes = e.Router();

FileRoutes.post('/upload-file', AuthenticateUser, upload.single('fileName'), FileController.uploadFile);
FileRoutes.get('/get-all-the-files-uploaded-by-current-user',AuthenticateUser,  FileController.getAllTheFilesUploadedByCurrentUser);
FileRoutes.get('/download-file/:fileUniqueID', FileController.getFileForDownload);

export default FileRoutes;
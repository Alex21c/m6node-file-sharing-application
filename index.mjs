/**
 * ## Objectives: 
 * 1. Implement user authentication and authorization mechanisms.
 *  + here i will copy the existing url shortenner codebase, and make sure that it is responding well with the session timeout expiry check
 *  + Here for the front end i will use react js codebase for url shortener
 * 
 * 2. Develop secure and efficient APIs for file upload, download, and sharing.
 *  + user can upload the file, and see list of all the uploaded files
 *  + user can get share link
 *  + user can download the file
 */

import 'dotenv/config';
import express from 'express';
import UserRoutes from './Routes/User.Routes.mjs';
import FileRoutes from './Routes/File.Routes.mjs';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
  try {
   
  
  // Creating a express server
    let server = express();
    const PORT = process.env.PORT ? process.env.PORT : 3000;

    // Middleware for logging errors
    server.use(morgan('dev'));

  // Connecting to DB

    // console.log(process.env.MONGODB_CONNECTION_STRING);
    mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(()=>{ console.log('Connection Established with Database!');})
    .catch((error)=>{
      throw new Error('Unable to connect to DB');
    });

 
  // Allowing me to parse req.body
    server.use(express.json());

  
  // Use the CORS middleware, such that from localhost i can make requests
    server.use(cors({
      origin: 'http://localhost:3000' // Allow requests from this origin
    }));

    // server.use(cors({
    //   origin: 'https://frontend-m6node-day-7-project-url-shortener-application.vercel.app' // Allow requests from this origin
    // }));


  // Linking Routes
    server.use("/api/v1/user", UserRoutes);    
    server.use("/api/v1/file", FileRoutes);
    
  
  // error handling middleware
    server.use((err, req, res, next)=>{
      // console.log(err);
      const metadata = err?.metadata || {};
      res.status(err.statusCode || 500).json(metadata)
    });  

  // launching server
    server.listen(PORT, ()=>{
      console.log(`Express Server is up and running at port ${PORT}`);
    });

  } catch (error) {
    console.log('Index.mjs ERROR: ' +  error.message)
  }



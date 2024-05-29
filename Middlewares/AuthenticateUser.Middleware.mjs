import jwt from 'jsonwebtoken';
import 'dotenv/config';
import UserModel from '../Models/User.Model.mjs';
import {throwNewError} from '../utils/utils.mjs';


export default async function AuthenticateUser(req, res, next){
  let authToken = req.headers['auth-token'];
  // if token is not provided tell me they need to authenticate  
    if(!authToken){
      next(throwNewError(401, {
        success: false,
        message: "Auth token not provided!",
        isAuthTokenValid: false
      }));
      return;

    }

  // is auth token in-valid? tell me to sign in once again
  try {
    const payload = jwt.verify(authToken, process.env.PRIVATE_KEY);
  // append id to req body
    req.userID = payload._id;  

  } catch (error) {
    // console.log(error.message)
    next(throwNewError(401, {
      success: false,
      message: "Invalid email or password !",
      isAuthTokenValid: false
    }));
    return;

    
  }

  // one more check, does that user exist in DB, it might be possible that user is delete and token still being used, like headless snake biting
  try {
    // console.log(req.userID)
    let response = await UserModel.findById(req.userID);
    if(!response){      
      throw new Error("invalid user");
    }
  

  } catch (error) {
    next(throwNewError(401, {
      success: false,
      message: error.message,
      isAuthTokenValid: false
    }));
    return;
  
  }

  // res.end('wait writing logic...');
  // return;

  // allow user to proceed
    next();
}
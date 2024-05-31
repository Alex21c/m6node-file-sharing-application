import UserModel from '../Models/User.Model.mjs'
import bcrypt from "bcrypt";
import 'dotenv/config';
import jwt from 'jsonwebtoken';



function generateJWT(userID){
  return jwt.sign({
    _id: userID
  }, process.env.PRIVATE_KEY, { expiresIn: process.env.USER_SESSION_EXPIRES_AFTER});

}

async function isUserAlreadyExistInDB(UserModel, email){
  const result = await UserModel.find({
    email: email
  });
  // console.log(result);
  if(result.length==0){
    return false;
  }
  // default is
    return true;
}

async function generateHashedPassword(password){
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

const signUpUser= async (req, res)=>{
  try {
    // Testing      
    // Safeguard does user already exist in DB?
      if(await isUserAlreadyExistInDB(UserModel, req.body.email)){
        // termniate
        res.status(409).json({
          success: false,
          message: "User already exist !"
        });
        return;      
      }

    req.body.accountCreatedOn = new Date();
    req.body.lastLogin = new Date();
    // encrypting the password
      req.body.passwordHash  = await generateHashedPassword(req.body.password);
      
    // storing into DB      
      const objUserModel = new UserModel(req.body);

      // console.log(objUserModel);
      await objUserModel.save();

  
  // return the jwt token
    const jwtToken = generateJWT(objUserModel._id); 
    res.json({
      success: true,
      message: "User Account created successfully !",
      'auth-token': jwtToken
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message : "Failure to add new user, internal sever error!"
    })
  }
  // console.log( req.body)

}
const signInUser= async(req, res)=>{  
  // console.log(req.method);
  // console.log(req.body);
  try {
    // check if provided user email exit in DB?
      const result = await UserModel.find({
        email: req.body.email
      });
      if(result.length ===0 ){
        res.status(401).json({
          success: false,
          message: "Invalid email or password !"
        });
        return;
      }

    // check if password is matching
      const isPasswordValid = await bcrypt.compare(req.body.password, result[0].passwordHash);
      if(!isPasswordValid){
        res.status(401).json({
          success: false,
          message: "Invalid email or password !"
        });        
        return;
      }
      
    // update last login field
      const jsonObj={
        lastLogin: new Date()
      }
      await UserModel.findByIdAndUpdate(result[0]._id, jsonObj);

    // return the jwt token
      // console.log(result[0]._id);
      const jwtToken = generateJWT(result[0]._id);  
      
    res.json({
      success: true,
      message: jwtToken
    });
    
   
  } catch (error) {    
   res.status(500).json({
    success: false,
    message: "Internal Server Error"
   });
  }


}

// Helps to validate the auth token
const validateAuthToken= async(req, res)=>{
  res.json({
    isAuthTokenValid: true
  });
}

const handshakeHello = async (req, res)=>{
  res.json({
    success: true,
    message: "hi there!"
  });
}

const UserController = {
  signUpUser,
  signInUser,
  validateAuthToken,
  handshakeHello
};
export default UserController;



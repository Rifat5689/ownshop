
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import User from "./user.model.js";
import jwt from "jsonwebtoken"; 
import { cookieOptions, generateAccessAndRefreshToken } from "./user.utils.js";


const register = asyncHandler(async (req, res) => {
     
     const {name , email, password } = req.body   ;

      if(!name ) throw new ApiError(400,"username required") ; 
      if(!email) throw new ApiError(400, "email required") ; 
      if(!password) throw new ApiError(400, "password  required")  ; 
      
      let user = await User.findOne({$or : [{username:name} , {email}]});
      if(user) throw new ApiError(400 , "user already exists ")  ; 
    
    
      user = await User.create({ 
         username : name  , email , password 
      })

      const { accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);
     const  createdUser = await User.findById(user._id).select("username email role ") ; 
      res.
      cookie("accessToken", accessToken ,{
           maxAge: 24 * 60 * 60 * 1000, 
          ...cookieOptions

      } ).
      cookie("refreshToken" ,refreshToken ,{
         maxAge : 365*24*60*60*1000 , 
          ...cookieOptions
      }).status(201).json(
        new ApiResponse(201,createdUser, 'user created successfully ' )
      )
      

})

const logIn = asyncHandler(async (req,res) => {

   const {email  , password} = req.body ; 

   if(!email) throw new ApiError(400, "email required") ; 
   if(!password) throw new ApiError (400 , "password required") ; 
   let user =await  User.findOne({email});
    if(!user) throw new ApiError(404 , "User not found ") ; 

   const isMatch =await  user.isPasswordCorrect(password) ; 
   if(!isMatch) throw new ApiError(401 , "Password is not correct " ) ; 


    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id) ; 
 const safeUser = user.toObject();
delete safeUser.password;
delete safeUser.refreshToken ; 
    res.cookie("accessToken", accessToken ,{
      ...cookieOptions, 
           maxAge: 24 * 60 * 60 * 1000, 
           

      } ).
      cookie("refreshToken" , refreshToken , {
          ...cookieOptions, 
         maxAge : 365*24*60*60*1000 , 
    
      }).status(200).json(new ApiResponse(200 ,safeUser , "login successfull "  ))
})

const logOut = asyncHandler(async (req, res) =>{ 

   const userId = req.user._id ; 
   const user = await User.findByIdAndUpdate(userId,
      {
         $set : {refreshToken : null} 
      },
      {new : true }
   ) ; 
   

    if(!user) throw new ApiError(404 , "User not found ") ; 
   res.clearCookie("accessToken",cookieOptions).
   clearCookie("refreshToken",cookieOptions).
   status(200).json(new ApiResponse(200,"Logged out successfully")) ; 

})

const refreshToken = asyncHandler(async(req,res) =>{
   
   const token = req.cookies?.refreshToken || 
              req.headers["authorization"]?.replace("Bearer ", "");

              let decodedToken ; 
  try {
   decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
} catch (err) {
  if (err.name === "TokenExpiredError") throw new ApiError(401, "Token expired");
  throw new ApiError(401, "Invalid token");
}
   const {_id} = decodedToken  ; 
   const user =await  User.findById(_id) ; 

   if(!user || user.refreshToken !=token) throw new ApiError(401, "Invalid refresh token");



   const {accessToken , refreshToken:newRefreshToken} = await generateAccessAndRefreshToken(_id) ;
   res.cookie("accessToken", accessToken , {...cookieOptions ,maxAge: 24 * 60 * 60 * 1000 }).
   cookie("refreshToken" , newRefreshToken , {...cookieOptions , maxAge: 365* 24 * 60 * 60 * 1000})
   .status(200).json(new ApiResponse(200 ,  "Token refreshed successfully")) 
   
})



export {register , logIn , logOut , refreshToken} ;
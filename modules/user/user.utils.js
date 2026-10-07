import ApiError from "../../utils/ApiError.js";
import User from "./user.model.js";

const generateAccessAndRefreshToken = async (id) =>
{
const user = await User.findById(id)  ; 
     if(!user) throw new ApiError(500, "something went wrong while generating access and refreshToken") ; 
    const accessToken = await  user.generateAccessToken() ; 
    const refreshToken =await  user.generateRefreshToken() ; 
    user.refreshToken = refreshToken  ; 
   await  user.save({ validateBeforeSave: false }) ; 
    return {accessToken , refreshToken} ; 

}

 const cookieOptions = {
  httpOnly: true,
  secure: true
};

export {generateAccessAndRefreshToken,cookieOptions} ; 
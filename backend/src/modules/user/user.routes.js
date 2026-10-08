import { Router } from "express";
import { logIn, logOut, refreshToken, register } from "./user.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";


const userRouter = Router() ; 

userRouter.route("/auth/register").post(register)  ; 
userRouter.route('/auth/login').post(logIn) ; 
userRouter.route("/auth/logout").post(verifyJwt,logOut) ;
userRouter.route("/auth/refreshtoken").post(refreshToken) ; 

export {userRouter} ; 
import { Router } from "express";
import { logIn, logOut, refreshToken, register } from "./user.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";


const router = Router() ; 

router.route("/auth/register").post(register)  ; 
router.route('/auth/login').post(logIn) ; 
router.route("/auth/logout").post(verifyJwt,logOut) ;
router.route("/auth/refreshtoken").post(refreshToken) ; 

export {router} ; 
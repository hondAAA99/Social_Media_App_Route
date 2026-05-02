import type { NextFunction, Request, Response } from "express";
import { ErrorUnAuthorizedRequest } from "../utils/globalresponse.js";


export  function authorize(arrOfRoles : string[]){
    return (req:Request,res:Response,next:NextFunction)=>{
        const {user} = req;
        if (!arrOfRoles.includes(user?.role as string)){
            ErrorUnAuthorizedRequest('you are not authorized')
        }
        next();
    }
}
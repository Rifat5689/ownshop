import { Router } from "express";
import { categoryById, createCategory } from "./category.controller.js";






const categoryRouter= Router() ; 

categoryRouter.route("/").post(createCategory) ; 
categoryRouter.route("/:id").get(categoryById) ; 

export default categoryRouter ; 
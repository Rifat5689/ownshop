import { Router } from "express";
import { createProduct, deleteProduct, getAllPrdoucts, getProductById, updateProduct } from "./product.controller.js";


const productRouter = Router() ; 





productRouter.route('/').post(createProduct).get(getAllPrdoucts) ; 
productRouter.route('/:id').get(getProductById).patch(updateProduct).delete(deleteProduct); 


export default productRouter ; 

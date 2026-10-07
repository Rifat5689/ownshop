import { generateUniqueSlug } from "../../../../services/slug.service.js";
import ApiError from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import uploadImages from "../../utils/uploadImages.js";
import Product from "./product.model.js";
import { getPagination } from "./product.utils.js";


const createProduct = asyncHandler(async(req,res) =>{
    

    const {
    name,
    description = "",
    title = "",
    subtitle = "",
    shortDescription = "",
    price,
    category,
    stock = 0,
    discount = 0,

  } = req.body;

  if (!name || price === undefined) {
    throw new ApiError(400, "Name and price are required");
  }

  const images = await uploadImages(req.files);
  if (!images) throw new ApiError(400, "Images are required");

  const slug = await generateUniqueSlug(name);


      const product = await Product.create({

     name,
    description,
    title,
    subtitle ,
    shortDescription,
    price,
    category,
    stock,
    slug,
    discount,
    images 


      }); 

      return res.status(200).
      json(new ApiResponse (200 , product , "product created successfully")) 
        
})

const getAllPrdoucts = asyncHandler(async(req,res) =>
{
     const {limit , skip } = getPagination(req.params) ;

     const products = await Product.find().sort({createdAt:-1}).skip(skip).limit(limit).select(" -__v") ; 
     if(!products.length) throw new ApiError(404 , "Prodcuts not found")  ;
     return res.status(200).json(
        new ApiResponse(200 , products , "product sent successfully") 

     )


}) 

const getProductById = asyncHandler(async(req,res) =>{

    const {id} = req.params ; 

    if(!id) throw new ApiError(400 , "Invalid request") ; 
    const product = await Product.findById(id) ; 
    if(!product ) throw new ApiError(404, "Product not found") ; 
    return res.status(200).
    json(new ApiResponse(200, product , "product sent successfully"))
})

const getProductByslug = asyncHandler(async(req,res) =>{
    const {slug} = req.params ; 
    const product = await Product.findOne({slug}) ; 
    if(!product ) throw new ApiError(404, "Product not found") ; 
    return res.status(200).
    json(new ApiResponse(200, product , "product sent successfully"))

})

const updateProduct = asyncHandler(async(req,res) =>{

      const {id} = req.params ; 
     const { name, description, title, subtitle, shortDescription, price, category, stock, discount } = req.body ;
     const updatedContent = { name, description, title, subtitle, shortDescription, price, category, stock, discount };
     const updatedProduct = await Product.findByIdAndUpdate(id , 
        updatedContent , 
        {new : true,runValidators: true
 } 
     )
     if(!updatedProduct) throw new ApiError(404 , "Product not found " ) ; 
     return res.status(200).json(
        new ApiResponse(200, updatedProduct , "Product updated successfully") 
     )


})
const deleteProduct = asyncHandler(async(req, res) =>{

    const {id} = req.params ; 

    const deletedProduct = await Product.findByIdAndDelete(id) ; 

    if(!deletedProduct) throw new ApiError(404 , "Product not found ") ; 
   return  res.status(200 ).json(
        new ApiResponse(200 , null , "Product deleted successfully") 
    )


})









export {getAllPrdoucts , createProduct , getProductById , getProductByslug,updateProduct, deleteProduct } ; 

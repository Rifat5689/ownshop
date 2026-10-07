import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import Order from "./order.model.js";
import { getPagination } from "../product/product.utils.js";



const createOrder = asyncHandler(async(req,res) =>{
    const {orderItems , shippingDetails, totalPrice} = req.body ; 
    const {userId} = req.user ; 
    const  identipotentKey = req.headers['identipotentKey']  ; 
   
     const existing = await Order.findOne({identipotentKey}) ; 
     if(existing) return res.status(200).json(
        new ApiResponse(200 , existing , "Order already exist")  
     ) ; 

     const order = await Order.create({
         userId , 
         orderItems , 
         shippingDetails ,
         totalPrice,
         identipotentKey

     })

     return res.status(201).json(
        new ApiResponse(201 , order , 'Order created successfully')  
     )

     

})

const getOrder = asyncHandler(async (req, res) =>{
     const {userId} = req.user ; 

     const orders = await Order.find({userId}).select("-identipotentKey").sort({createdAt: -1 } ).limit(10) ; 
     if(!orders.length) return res.status(200 ).json(
        new ApiResponse(200 , null , 'Order not found') 
     )

     return res.status(200).json(
        new ApiResponse(200, orders,"Orders fetched successfully" )  
     )

})

const getAllOrders = asyncHandler(async(req,res) => { 
    
   const  {status} = req.params ; 
   const query = {} ; 
   if(status!== "all") query.status = status ; 
    const {limit , skip  } = getPagination(req.query) ; 

    const orders = await Order.find(query).sort({createdAt : -1}).skip(skip).limit(limit) ; 
    
    return res.status(200).json(new ApiResponse(200 , orders , "Orders fetched ")) ;
    
})

// total revenue 
// total orders
// total customers

// dashboard graph 
// last 30 days data 
// total order by each day ..  0 , 5, 10 , 15, 20 , 25, 30 
const getDashboardsummary  = asyncHandler(async(req,res) => {
      
    const raw =await  Order.aggregate([
        {$facet : {
              totalRevenue : [
                 {
                     $match : {"payment.paymentStatus" : "paid"} , 

                 },{ 
                      $group : {_id : null , 
                        total  : {$sum : "$totalPrice"}
                     }
                 }
              ],

              totalOrders : [
                 {$group : {_id : null , 
                    total : {$sum : 1} 
                 }}
              ],
              totalCustomers : [
                 {
                     $group : {_id :  "$userId" }
                 },
                 {
                     $count : "total" 
                 }
              ]
        }}
    ])

    const result = raw[0];
    const totalRevenueVal = result.totalRevenue?.[0]?.total || 0;
    const totalOrdersVal = result.totalOrders?.[0]?.total || 0;
    const totalCustomersVal = result.totalCustomers?.[0]?.total || 0;

        
           



    const summary = {
         totalRevenue: totalRevenueVal,
         totalOrders: totalOrdersVal,
         totalCustomers: totalCustomersVal
    }

    return res.status(200).
    json(new ApiResponse(200 , summary , "Stats sent " ));

})

const getDashboardAnalytics = asyncHandler(async (req,res)=>{
     const {range} = req.body ; 

     // last week 
     
       if(range ==='weekly') {
            
         const sevenDaysAgo = new Date(Date.now() - 7*3600*24*1000) ; 
          const weeklyOrders =  await Order.aggregate([
            {
               
               $match :  { createdAt : {$gte : sevenDaysAgo}}},
              {
               
                 $group : {
                    _id : {
                      $dateToString : {
                         format : "%d-%m-%y" , 
                         date : "$createdAt" 
                      }
                    },
                    totalOrders : {$sum : 1} , 
                 }



              },{
                 $sort : {_id : 1} 
              }
          ])

          return res.status(200).json(
            new ApiResponse(200 , weeklyOrders , "Weekly analytics fetched")
          )
       }
   

     else if(range ==="monthly") 
     {
        const thirtyDaysAgo = new Date(Date.now() - 30*3600*24*1000) ; 
        const monthlyOrders =  await Order.aggregate([
          {
             
             $match :  { createdAt : {$gte : thirtyDaysAgo}}},
            {
             
               $group : {
                  _id : {
                    $dateToString : {
                       format : "%d-%m-%y" , 
                       date : "$createdAt" 
                    }
                  },
                  totalOrders : {$sum : 1} , 
               }



            },{
               $sort : {_id : 1} 
            }
        ])

        return res.status(200).json(
            new ApiResponse(200 , monthlyOrders , "Monthly analytics fetched")
          )
     }
     
     else {
        return res.status(400).json(
            new ApiResponse(400 , null , "Invalid range. Use 'weekly' or 'monthly'")
          )
     }

})
  
const analytics = asyncHandler(async(req,res) => {
     
   //revenue..order..customer 
   

})


import { model, Schema } from "mongoose";

const orderItemSchema = new Schema({
    productId : {
         type : Schema.Types.ObjectId,
         ref : "Product" ,
         required : true 
    },
    quantity : {
         type : Number , 
         min : 1,
         required :true 
    }
},{_id : false})
const paymentSchema = new Schema({
     paymentMethod : {
         type : String , 
         enum : ['cash on delivery' , 'bkash', 'nagad'],
         default : 'cash on delivery'
     },
     paymentStatus : {
         type : String , 
         enum : ['pending' , 'paid'] , 
        default : 'pending' 
     },
     paymentId : {
         type : String , 
         default : null 
     }
},{_id: false})

const orderSchema = new Schema({

      userId : {
         type : Schema.Types.ObjectId , 
         ref : 'User',
         required : true 

      },
      orderItems : [orderItemSchema],
       shippingDetails : {
        name : String , 
        phone : String , 
        address : String ,
     
       },
       totalPrice : {
         type : Number , 
        required : true 
      },

      payment : paymentSchema , 
      status :{
         type : String , 
         enum : ['pending','confirmed', 'processing','delivered'],
         default : 'pending' 
      },
      identipotentKey : String 

},{timestamps : true })

const Order  = model('Order' , orderSchema ) ; 
export default Order ;


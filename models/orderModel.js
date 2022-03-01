const mongoose=require('mongoose');

const User=require('./userModel');
const Item=require('./itemModel')

const orderSchema=new mongoose.Schema({
sent:{
 type:Boolean
},
received:{
type:Boolean
},
orderarr:[String]
,
username:{
type:String
}
   
    
})
const Order=mongoose.model('Order',orderSchema);
module.exports=Order;




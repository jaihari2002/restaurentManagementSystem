const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/Mybag', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("Connected to db");
});
// mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
const User=require('./userModel');
const Order=require('./orderModel');
const itemSchema=new mongoose.Schema({
    itemname:{
        type:String,
        required:true},
    manufacturerName:{
        type:String,
        required:true},
    category:{
        type:String,
        required:true},
    rating:{
        type:Number,
        required:true},
    price:{
        type:Number,
        required:true},
    url:{
            type:String,
            required:true
        },
    about:{
            type:String,
            required:true
        },
   
    
})
const Item=mongoose.model('Item',itemSchema);
module.exports=Item;

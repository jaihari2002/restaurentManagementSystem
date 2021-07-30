const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/Mybag', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log("Connected to db");
});
const User=require('./userModel');
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
    user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
    
})
const Item=mongoose.model('Item',itemSchema);
module.exports=Item;

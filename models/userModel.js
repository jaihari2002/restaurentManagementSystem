const mongoose=require('mongoose');
const Item=require('./itemModel')
const Order=require('./orderModel');

const passportLocalMongoose = require('passport-local-mongoose');
const userSchema=new mongoose.Schema({
    userarr:[String]   
})
userSchema.plugin(passportLocalMongoose);
const User=mongoose.model('User',userSchema);
module.exports=User;

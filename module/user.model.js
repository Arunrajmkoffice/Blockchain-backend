const mongoose = require('mongoose');

const subUserSchema = new mongoose.Schema({
    email:{type:String,require:true},
    password:{type:String,require:true},
    role:{type:String,require:false},
    canAddProduct: {type:Boolean,require:false},
    vendorId:{type:String,require:false},
})

const userSchema = new mongoose.Schema({
    email:{type:String,require:true},
    password:{type:String,require:true},
    role:{type:String,require:false},
    vendorId:{type:String,require:false},
    subUser:[subUserSchema],
    verificationToken:{type:String,require:false},
    resetToken:{type:String,require:false},
    resetTokenExpiration: {type:String,require:false},
    vendorName:{type:String,require:false},
    name:{type:String,require:false},
    address:{type:String,require:false},
})

const userModel = mongoose.model("userCridential", userSchema)
module.exports = {userModel}
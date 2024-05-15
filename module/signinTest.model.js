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
    verified:{type:String, default:false}
})

const signUpModel = mongoose.model("signUp", userSchema)
module.exports = {signUpModel}
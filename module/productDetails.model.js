const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
     productAt: { type: String, required: false },
     date: { type: String, required: false },
     time: { type: String, required: false },
     complete: { type: Boolean, required: false },
 });

 const imageSchema = new mongoose.Schema({
     imageData: { type: String, required: false},
     id: { type: String, required: false }
 });

 const qrSchema = new mongoose.Schema({
    tracking:[trackingSchema]
});

 const productDetails = new mongoose.Schema({
     product:{type:String,require:true},
     price:{type:String,require:true},
     sku:{type:String,require:true},
     branchNumber:{type:String,require:true},
     countryOfOrigin:{type:String,require:true},
     inventory:{type:String,require:true},
     description:{type:String,require:true},
     tag:{type:String,require:true},
     brand:{type:String,require:true},
     category:{type:String,require:true},
     salesPrice:{type:String,require:true},
     createdDate:{type:String,require:true},
     createdTime:{type:String,require:true},
     image:[imageSchema],
     tracking:[trackingSchema],
     id: { type: String, required: true, unique: true },
     plot_embedding_hf:{type:Array,require:false},
     vendorId:{type:String,require:true},
     qr:[qrSchema]
});

const productDetailsModel = mongoose.model("productDetails", productDetails);
module.exports = {productDetailsModel, productDetails}
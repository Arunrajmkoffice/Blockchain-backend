const mongoose = require('mongoose');
const searchPathModel = new mongoose.Schema({
    path:{type:String,require:true},
    description:{type:String,require:true},
    name:{type:String,require:true},
    data:{type:Object,require:true},
    plot_embedding_hf:{type:Array,require:true}
})

const searchPath = mongoose.model("searchPath", searchPathModel)
module.exports = {searchPath}
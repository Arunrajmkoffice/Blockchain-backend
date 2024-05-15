const mongoose = require('mongoose')

const uri = process.env.MONGODB_URI;

const connection = mongoose.connect(uri);
module.express = {connection}
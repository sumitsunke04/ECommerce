const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    suppID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Supplier',
        required:true
    },
    prodName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
})


const Product = mongoose.model('Product',productSchema)

module.exports = Product

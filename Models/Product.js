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
    },
    inStockQuantity:{
        type:Number,
        default:1,
    },
    availability:{
        type:String,
        enum:["inStock","outOfStock","limitedStock"],
        default:"inStock"
    }
})


const Product = mongoose.model('Product',productSchema)

module.exports = Product

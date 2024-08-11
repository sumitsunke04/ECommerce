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
        enum:['Clothing','Electronics','Personal Care','Health','Sports','Toys','Books','KitchenWare','Automotive','Jewellery','Groceries','Art and Craft','General'],
        default:'General'
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
    },
    imageURL:{
        type:String
    }
})


const Product = mongoose.model('Product',productSchema)

module.exports = Product

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[
        {
            productID:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            }
        }
    ],
    totalCost:{
        type:Number,
        // required:true
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        enum:["pending","shipped","delievered","cancelled"],
        default:"pending"
        //only values in the enum can be set as status
    }
})

const Order = mongoose.model('Order',orderSchema)

module.exports = Order;
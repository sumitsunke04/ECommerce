const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    products:{
        type:[
            {
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
                quantity:{
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
            }
        ]
    },
    cost:{
        type:Number,
        required:true
    },
    orderDate:{
        type:Date,
        required:true
    }
})

const Order = mongoose.model('Order',orderSchema)

module.exports = Order;
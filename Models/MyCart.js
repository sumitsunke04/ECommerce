const mongoose = require('mongoose')

const cartSchema = new  mongoose.Schema({
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
    ]
})

const MyCart = mongoose.model('MyCart',cartSchema)

module.exports = MyCart
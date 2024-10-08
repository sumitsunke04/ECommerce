const mongoose = require('mongoose')

const supplierSchema = new mongoose.Schema({
    companyName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
    },
    user_type: {
        type: String,
        enum: ['user', 'supplier', 'admin'],
        default: 'supplier' 
    }
})

const Supplier = mongoose.model('Supplier',supplierSchema)

module.exports = Supplier;
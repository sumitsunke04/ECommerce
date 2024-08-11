const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
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
        type:String
    },
    user_type: {
        type: String,
        enum: ['user', 'supplier', 'admin'],
        default: 'user' 
    }

}) 


const User = mongoose.model('User',userSchema)

module.exports = User;

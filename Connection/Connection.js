
const mongoose = require('mongoose')

const url = 'mongodb+srv://sumitmongodb:sumitmongodb@cluster0.avkfdej.mongodb.net/learnIMS?retryWrites=true&w=majority'

mongoose.connect(url)
.then(()=>{
    console.log("Successfully connected with the database")
})
.catch((err)=>{
    console.log("error during connection with the database ",err)
})
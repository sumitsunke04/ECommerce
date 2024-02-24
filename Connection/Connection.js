
const mongoose = require('mongoose')

const url = process.env.URL

mongoose.connect(url)
.then(()=>{
    console.log("Successfully connected with the database")
})
.catch((err)=>{
    console.log("error during connection with the database ",err)
})
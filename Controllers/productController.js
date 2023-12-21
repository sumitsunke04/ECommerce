const Product = require("../Models/Product");

const addProduct = async(suppID,prodName,price,category,description)=>{
    try{
        
        const product = new Product({suppID,prodName,price,category,description});

        const savedProduct = await product.save();

        return savedProduct;
    }
    catch(err){
        console.log("Error adding product",err);
    }
}

const updateProduct = async(suppID,productID,updatedData)=>{
    try{

        //find the product using corresponding productID and requesters suppID
        const product = await Product.findOne({_id:productID,suppID});
        if(!product){
            console.log("Product not found")
            return ;
        }

        //update the values
        product.prodName = updatedData.prodName || product.prodName;
        product.price = parseInt(updatedData.price) || product.price;
        product.category = updatedData.category || product.category;
        product.description = updatedData.description || product.description;

        //save the product
        const updatedProduct = await product.save();
        return updatedProduct;
    }catch(err){
        console.log(err)
    }
}

const deleteProduct = async(suppID,productID)=>{
    try{
        const product = Product.findOne({_id:productID,suppID})

        if(!product){
            res.status(404).send("Product not found for deletion")
        }

        await Product.deleteOne({_id:productID,suppID})

        console.log("Product deleted successfully ")
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {addProduct,updateProduct,deleteProduct};
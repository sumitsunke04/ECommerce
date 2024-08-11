const Product = require("../Models/Product");
const cloudinary = require('../cloudinaryConfig');


// const addProduct = async(suppID,prodName,price,category,description,inStockQuantity,availabilityStatus,imageURL)=>{
//     try{
//         console.log('herre the quantitiy become',inStockQuantity)
        
//         const product = new Product({suppID,prodName,price,category,description,inStockQuantity,availabilityStatus,imageURL});

//         console.log('product added ',product)
//         const savedProduct = await product.save();

//         return savedProduct;
//     }
//     catch(err){
//         console.log("Error adding product",err);
//     }
// }

exports.updateProduct = async(suppID,productID,updatedData)=>{
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
        product.inStockQuantity = updatedData.inStockQuantity || product.inStockQuantity;
        product.availabilityStatus = updatedData.availabilityStatus || product.availabilityStatus;

        //save the product
        const updatedProduct = await product.save();
        return updatedProduct;
    }catch(err){
        console.log(err)
    }
}

exports.deleteProduct = async(suppID,productID)=>{
    try{
        const product =await Product.findOne({_id:productID,suppID})


        if(!product){
            res.status(404).send("Product not found for deletion")
        }
        console.log('product0',product)
        
        const cnt = await Product.deleteOne({_id:productID,suppID})
        console.log('cnt',cnt)
        console.log("Product deleted successfully ")
    }
    catch(err){
        throw new Error(err.message)
    }
}


exports.getAllProducts = async(req,res)=>{
    try{
        const products = await Product.find();
        return res.status(200).json(products);
    }
    catch(err){
        console.log(err);
    }
}

exports.getSupplierProducts = async(req,res)=>{
    try{
        const suppID = req.currSupplier.supp_id;
        const products = await Product.find({suppID:suppID});
        return res.status(200).json(products)
    }catch(error){
        console.log('error is here')
        console.log(error.message)
    }
}

exports.addProduct = async(req,res)=>{
    try{
        const {prodName,price,category,description,inStockQuantity,availabilityStatus} = req.body;
       
        if(!prodName || !price || !category || !description){
            res.status(400).send("All fields are required")
        }
        if(inStockQuantity < 0){
            return res.status(500).send("Stock Quantity Cannot Be Negative ");
        }

        console.log('body : ',req.body)
        console.log('file : ',req.file);
        const fileBuffer = req.file.buffer;
        const imageURL = await cloudinary.uploadImageToCloudinary(fileBuffer);

        
        const suppID = req.currSupplier.supp_id;
        console.log('herre the quantitiy become',inStockQuantity)
        
        const product = new Product({suppID,prodName,price,category,description,inStockQuantity,availabilityStatus,imageURL});

        console.log('product added ',product)
        const savedProduct = await product.save();

        return savedProduct;
        // const addedProduct = await addProduct(suppID,prodName,price,category,description,inStockQuantity,availabilityStatus,imageURL);

        // res.status(201).json(addedProduct);
    }
    catch(err){
        console.log("Error in adding product (post method)",err);
    }
}



// module.exports = {updateProduct,deleteProduct};
// module.exports = {updateProduct};
const { ObjectId } = require("mongodb");
const MyCart = require("../Models/MyCart");
const Product = require("../Models/Product");



const addToCart = async(userID,productID,quantity) =>{
    try{
        console.log('there is no error while adding to cart')
        let currentCart = await MyCart.findOne({userID:userID});

        if(!currentCart){
            currentCart = new MyCart({userID:userID,items:[]});
        }

        const existingItem =await currentCart.items.find(itemInCart=>itemInCart.productID.equals(productID));

        if(existingItem){
            existingItem.quantity = Number(existingItem.quantity) + Number(quantity||1);
        }
        else{
            currentCart.items.push({productID:productID,quantity:quantity || 1});
        }

        //decrease the quantity from database
        const convertedProductID = new ObjectId(productID);
        const product = await Product.findOne({_id:convertedProductID});
        const prevQuantity = Number(product.inStockQuantity);
        const newQuantity = Number(prevQuantity-quantity);
        product.inStockQuantity = Number(newQuantity);
        await product.save();
        console.log("Quantity Updated after : ",product);

        await currentCart.save();
        console.log("Successfully added to cart ");
    }
    catch(err){
        console.log('this is an error while adding to cart')
        console.log('error is :',err);
    }
}

const deleteFromCart = async(userID,productID)=>{
    try{
        let currentCart = await MyCart.findOne({userID:userID});

        if(!currentCart){
            console.log("User Dont Have a Cart!!");
        }

        console.log('productID is',productID)
        const objectIdProductID = new ObjectId(productID);
        console.log(objectIdProductID)
        console.log('current cart items : ',currentCart.items)
        const itemExists =  currentCart.items.find(itemInCart=>itemInCart.productID.equals(productID));

        
        if(!itemExists){
            console.log("Item doesn't exist in Cart");
            return ;
        }
        console.log("Printing ItemExists : ",itemExists);
        const cartQuantity = Number(itemExists.quantity);
        const convertedProductID = new ObjectId(productID);
        const product = await Product.findOne({_id:convertedProductID});
        product.inStockQuantity = Number(product.inStockQuantity)+cartQuantity;
        await product.save();


        await MyCart.updateOne({userID:userID},{$pull:{items:{productID:objectIdProductID}}});

        console.log("Successfully removed from Cart and updated the respective quantity of product in database");

    }
    catch(err){
        console.log(err);
    }
}

module.exports = {addToCart,deleteFromCart};
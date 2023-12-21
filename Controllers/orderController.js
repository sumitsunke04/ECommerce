const MyCart = require("../Models/MyCart");
const Order = require("../Models/Order");
const Product = require("../Models/Product");

async function calculateCost(items){
    let totalCost = 0;

    if(!items || items.length === 0){
        console.log("Items array is empty")
        return ;
    }
    //iterate over each entity in items array
    for(const item of items){
        try{

            //find the product
            const product = await Product.findById(item.productID);
            
            //calculate the cost
            if(product){
                totalCost += (product.price*item.quantity);
            }
            else{
                console.log("Product not found with ID : ",productID)
            }

        }
        catch(err){
            console.log(err)
        }
    }
    return totalCost;
}

const addOrder = async(userID)=>{
    try{
        //find the corresponding cart
        let currentCart = await MyCart.findOne({userID:userID});

        if(!currentCart){
            console.log("Cart is empty. Cannot place an order")
        }

        //create new order from cart and also calculate totalCost using calculateCost function
        const newOrder = new Order({
            userID:userID,
            items:currentCart.items,
            totalCost:await calculateCost(currentCart.items)
        })

        const savedOrder = await newOrder.save();

        console.log("Order saved successfully");
        //after successfully placing the order clear the cart
        await MyCart.findOneAndUpdate({userID:userID},{$set:{items:[]}});
    }
    catch(err){
        console.log(err);
    }


}

module.exports = {addOrder,calculateCost};
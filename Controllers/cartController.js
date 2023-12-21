const MyCart = require("../Models/MyCart");



const addToCart = async(userID,productID,quantity) =>{
    try{
        let currentCart = await MyCart.findOne({userID:userID});

        if(!currentCart){
            currentCart = new MyCart({userID:userID,items:[]});
        }

        const existingItem =await currentCart.items.find(itemInCart=>itemInCart.productID.equals(productID));

        if(existingItem){
            existingItem.quantity+= quantity||1;
        }
        else{
            currentCart.items.push({productID:productID,quantity:quantity || 1});
        }
        await currentCart.save();
        console.log("Successfully added to cart ");
    }
    catch(err){
        console.log(err);
    }
}

const deleteFromCart = async(userID,productID)=>{
    try{
        let currentCart = await MyCart.findOne({userID:userID});

        if(!currentCart){
            console.log("User Dont Have a Cart!!");
        }

        const itemExists = await currentCart.items.find(itemInCart=>itemInCart.productID.equals(productID));

        if(!itemExists){
            console.log("Item doesn't exist in Cart");
        }

        await MyCart.updateOne({userID:userID},{$pull:{items:{productID:productID}}});

        console.log("Successfully removed from Cart");

    }
    catch(err){
        console.log(err);
    }
}

module.exports = {addToCart,deleteFromCart};
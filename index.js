const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt")
const {ObjectId} = require('mongodb')
const jwt = require('jsonwebtoken')
const User = require("./Models/User");
const dotenv = require('dotenv')
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser")
const {addProduct, deleteProduct} = require("./Controllers/productController");
const {updateProduct} = require("./Controllers/productController");

const auth = require("./Middleware/auth");
const Product = require("./Models/Product");
const Supplier = require("./Models/Supplier");

const {addToCart,deleteFromCart} = require("./Controllers/cartController");
const MyCart = require("./Models/MyCart");
const { addOrder } = require("./Controllers/orderController");
const Order = require("./Models/Order");
const { default: mongoose } = require("mongoose");

dotenv.config();
require('./Connection/Connection')
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:5174',
    credentials:true
}));

const authController = require('./Controllers/authController')
const productController = require('./Controllers/productController')

//-------------------Cloudinary----------------//
const cloudinary = require('./cloudinaryConfig');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage})
//---------------------------------------------//



app.post("/registerUser",authController.registerUser);

app.post('/loginUser',authController.loginUser);

app.post("/registerSupplier",authController.registerSupplier)

app.post('/loginSupplier',authController.loginSupplier);

app.post('/addProduct',auth.authorizeSupplier,upload.single('image'),productController.addProduct) 

app.get('/getAllProducts',productController.getAllProducts)

app.get('/getSupplierProducts',auth.authorizeSupplier,productController.getSupplierProducts)

app.put('/updateProduct/:productID',auth.authorizeSupplier,async(req,res)=>{
    console.log('came to updation')
    try{

        //all new values will be given through body
        console.log('request body',req.body)
        const {prodName,price,category,description,inStockQuantity,availabilityStatus} = req.body;
        if(inStockQuantity < 0){
            return res.status(500).send("Quantity cannot be negative")
        }

        //IMP : Pass productID through params
        const {productID} = req.params;

        //take supplier ID from currSupplier
        const suppID = req.currSupplier.supp_id;

        //Pass all the required arguments to update function
        const updatedProduct = await updateProduct(suppID,productID,{prodName,price,category,description,inStockQuantity,availabilityStatus});

        res.status(200).json(updatedProduct);
    }catch(err){
        console.log(err);
    }

    
})

app.delete('/deleteProduct/:productID',auth.authorizeSupplier,async(req,res)=>{

    const suppID = req.currSupplier.supp_id;
    const { productID } = req.params;

    try {
        await deleteProduct(suppID, productID);
        res.status(204).send(); // Successfully deleted
    } catch (err) {
        console.log('may be product is not found')
        res.status(400).json({ msg: err.message }); // Send error message
    }
})

app.post('/addToCart',auth.authorizeUser,async(req,res)=>{
    try{
        const userID = req.currUser.user_id;
        const {productID} = req.body;
        console.log('request is upto here',productID)
        quantity = 1;
        if(quantity < 0){
            return res.status(500).send("Quantity cannot be negative");
        }
        
        const convertedProductID = new ObjectId(productID);
        const product =await Product.findOne({_id:convertedProductID});
        console.log('now it is here')
        if(product){
            console.log('product details : ',product)
            const availableQuantity = Number(product.inStockQuantity);
            console.log('avail : ',availableQuantity)
            if(availableQuantity < quantity){
                return res.status(500).json({msg:`${quantity}, units are not available `})
            }
            const addedToCart = addToCart(userID,productID,quantity);
            res.status(200).json(addedToCart);
        }
        else{
            return res.status(500).send("Product Not Found")
        }
        
    }
    catch(err){
        console.log(err)
    }
})

app.get('/getCurrentCart',auth.authorizeUser,async(req,res)=>{
    
    const userID = req.currUser.user_id;
    console.log('got my userID',userID);

    let currentCart = await MyCart.findOne({userID:userID}).populate({
        path:'items.productID',
        select:'prodName price category description'

    })

    if(!currentCart){
        res.status(400).json({msg:"cant find cart"});
        return ;
    }
    console.log('got my cart',currentCart);

    // const plainCart = currentCart.toObject();
    
    res.status(201).json(currentCart);
})

app.delete('/deleteFromCart/:productID',auth.authorizeUser,async(req,res)=>{
    const userID = req.currUser.user_id;
    const {productID} = req.params;

    await deleteFromCart(userID,productID);
    res.status(204).send()
})

app.post('/addOrder',auth.authorizeUser,async(req,res)=>{
    try{
        const userID = req.currUser.user_id;

        const {address} = req.body;
        //from this user ID find corresponding cart and directly add it to order
        await addOrder(userID,address);
        res.status(201).send();
    }
    catch(err){
        console.log(err);
    }
})

app.get('/searchByName',auth.authorizeUser,async(req,res)=>{
    try{
        const searchTerm = req.query.q;
        const products = await Product.find({prodName:{$regex:searchTerm,$options:'i'}})
        res.json(products)
    }catch(err){
        console.log(err)
        res.status(500).json({msg:"Internal Server Error"})
    }
})

app.get('/searchByCategory',auth.authorizeUser,async(req,res)=>{
    try{
        const searchTerm = req.query.q;
        const products = await Product.find({category:{$regex:searchTerm,$options:'i'}})
        res.json(products)
    }catch(err){
        console.log(err)
        res.status(500).json({msg:"Internal Server Error"})
    }
})

app.get('/searchByFilter',auth.authorizeUser,async(req,res)=>{
    try{
        const {category,priceRange} = req.query;

        //create a filter object
        let filter = {};
        if(category){
            filter.category = category;
        }

        if(priceRange){
            const [minPrice,maxPrice] = priceRange.split('-');
            filter.price = {$gte:minPrice,$lte:maxPrice};
        }
        const products = await Product.find(filter);
        res.json(products);
    }
    catch(err){
        console.log(err);
        res.status(500).json({msg:"Internal Server Error"});
    }
})

app.get('/getOrderHistory',auth.authorizeUser,async(req,res)=>{
    console.log("request came here");
    try{
        const userID = req.currUser.user_id;
        const orders = await Order.find({userID:userID})
        .populate({
            path:'items.productID',
            select:'prodName price category description imageURL'
        })
        res.status(200).json(orders);
    }
    catch(err){
        console.log(err);
        res.status(500).json({msg:"Internal server error"})
    }
})

app.get('/getOrdersForSupplier',auth.authorizeSupplier,async(req,res)=>{
    console.log("here")
    try{
        //Take the supplier ID of the requester
        const suppID = req.currSupplier.supp_id;
        
        //List all the orders
        const allOrders = await Order.find();

        //This array will have all the order(product) details of requesting supplier
        let tempObj = [];

        //Iterate on List of Orders
        for (let eachOrder of allOrders){

            //Iterate over items array of a particular order
            for(let eachOrderItem of eachOrder.items){
            
                //Take the productID
               const productID = eachOrderItem.productID;
               //Convert it to type ObjectID otherwise it wont find the prodcut
               const convertedProductID = new ObjectId(productID);

               //Find the product where productID and suppID matches
               const product = await Product.findOne({_id:convertedProductID,suppID:suppID});

               //If product is found then create an object "arr"
               if(product){

                    //create temporary object arr and specify all the attributes
                    let arr={};
                    arr.orderID = eachOrder._id;
                    arr.productID = productID;
                    arr.prodName = product.prodName;
                    arr.price = product.price;
                    arr.quantity = eachOrderItem.quantity;
                    arr.orderDate = eachOrder.orderDate;
                    arr.status =  eachOrder.status;
                    arr.address = eachOrder.address;
                    arr.imageURL = product.imageURL;
                    //add it to tempObj array
                    tempObj = tempObj.concat(arr);
               }
               else{
                    console.log("Not for the requesting supplier")
               }
            }
        }
        res.status(200).send(tempObj)
    }
    catch(err){
        console.log(err)
        console.log("this is error")
        res.status(500).json({msg:"Internal server error"})
    }
})

app.post("/logout",authController.logout);

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})
  









// ----------------------------- FEATURES/ENDPOINTS TO BE ADDED -----------------------------------

// ************************************************************************
// User Features/Endpoints:

// Product Browsing:

// Endpoint to search for products based on various criteria such as category, price range, etc.
// Endpoint to view details of a specific product.

// Shopping Cart:
// Endpoint to update the quantity or remove items from the shopping cart.

// Checkout:
// Endpoint to initiate the checkout process.
// Endpoint to provide shipping information.
// Endpoint to confirm and place the order.

// Order History:
// Endpoint to track the status of current orders.

// Account Management:
// Endpoint to update user profile information.
// Endpoint to change password.
// Endpoint to delete the user account.

// Wishlist:
// Endpoint to add/remove products to/from the wishlist.
// Endpoint to view the wishlist.

// Reviews and Ratings:
// Endpoint to submit reviews and ratings for products.
// Endpoint to view reviews and ratings for products.

// ***********************************************************************
// Supplier Features/Endpoints:

// Product Management:
// Endpoint to view inventory status.

// Order Management:
// Endpoint to view incoming orders.
// Endpoint to update order status (e.g., processing, shipped, delivered).
// Endpoint to view order history.

// Analytics and Reporting:
// Endpoint to view sales analytics (e.g., revenue, top-selling products).
// Endpoint to generate reports (e.g., monthly sales report, inventory report).

// Supplier Profile Management:
// Endpoint to update supplier profile information.
// Endpoint to change password.
// Endpoint to delete the supplier account.

// Communication:
// Endpoint to communicate with customers (e.g., respond to inquiries, provide support).
// Endpoint to receive notifications for new orders, messages, etc.

// Inventory Management:
// Endpoint to manage inventory levels (e.g., restock products, mark products as out of stock).
// Endpoint to receive low stock alerts.





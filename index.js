const express = require("express");
const bcrypt = require("bcrypt")
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

dotenv.config();
require('./Connection/Connection')
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.post("/registerUser",async(req,res)=>{
    try{
        const {name,email,phone,password} = req.body;

        // console.log(req.body)
        if(!name || !email || !phone || !password){
            res.status(400).send("All inputs are required")
        }

        //check if email already exists
        const oldUser = await User.findOne({email})

        if(oldUser){
            return res.status(409).send("Email already exists, Please Login !")
        }

        // encrypt the password
        const encryptedPassword = await bcrypt.hash(password,10)

        //Create User
        const user = await User.create({
            name,
            email:email.toLowerCase(),
            phone,
            password:encryptedPassword
        })
        
        //Create token using (userID and email)
        const token = jwt.sign(
            {user_id:user._id,email},
            process.env.TOKEN_KEY,
            {
                expiresIn:"1h",
            }
        );

        //attach token with user object
        user.token = token;
        res.status(201).json(user);

    }
    catch(err){
        console.log(err);
    }
})

app.post('/loginUser',async (req,res)=>{
   try{
    const {email,password} = req.body;
    console.log(req.body)
    //check if both inputs are given
    if(!email || !password){
        res.status(400).send("All fields are required !!")
    }

    //user should already exist in database and password should match
    const user = await User.findOne({email});
    if(user && (await bcrypt.compare(password,user.password))){
        console.log(user)

        //generate token using userrID and email and attach it with user object
        const token=jwt.sign({user_id:user._id,email},
            process.env.TOKEN_KEY,
            {
                expiresIn:"1h",
            }
        )
        res.cookie("jwt",token,{httpOnly:true,secure:true,maxAge:60000})
        user.token=token;
        console.log("logged in successfully",user)
        return res.status(200).json({token});
        
    }
    return res.status(400).send("Invalid Credentials")
   }
   catch(err){
        console.log(err);
   }
})

app.post("/registerSupplier",async(req,res)=>{
    try{
        const {companyName,email,phone,password} = req.body;

        // console.log(req.body)
        if(!companyName || !email || !phone || !password){
            res.status(400).send("All inputs are required")
        }

        //check if email already exists
        const oldSupplier = await Supplier.findOne({email})

        if(oldSupplier){
            return res.status(409).send("Email already exists, Please Login !")
        }

        // encrypt the password
        const encryptedPassword = await bcrypt.hash(password,10)

        //Create User
        const supplier = await Supplier.create({
            companyName,
            email:email.toLowerCase(),
            phone,
            password:encryptedPassword
        })
        
        //Create token using (userID and email)
        const token = jwt.sign(
            {supp_id:supplier._id,email},
            process.env.TOKEN_KEY,
            {
                expiresIn:"1h",
            }
        );

        //attach token with user object
        supplier.token = token;
        res.status(201).json(supplier);

    }
    catch(err){
        console.log(err);
    }
})

app.post('/loginSupplier',async (req,res)=>{
    try{
     const {email,password} = req.body;
     console.log(req.body)
     //check if both inputs are given
     if(!email || !password){
         res.status(400).send("All fields are required !!")
     }
 
     //user should already exist in database and password should match
     const supplier = await Supplier.findOne({email});
     if(supplier && (await bcrypt.compare(password,supplier.password))){
         console.log(supplier)
 
         //generate token using userrID and email and attach it with user object
         const token=jwt.sign({supp_id:supplier._id,email},
             process.env.TOKEN_KEY,
             {
                 expiresIn:"1h",
             }
         )
         res.cookie("jwt",token,{httpOnly:true,secure:true,maxAge:60000})
         supplier.token=token;
         console.log("logged in successfully",supplier)
         return res.status(200).json({token});
         
     }
     return res.status(400).send("Invalid Credentials")
    }
    catch(err){
         console.log(err);
    }
 })

app.post('/addProduct',auth.authorizeSupplier,async (req,res)=>{
    try{
        const {prodName,price,category,description} = req.body;

        if(!prodName || !price || !category || !description){
            res.status(400).send("All fields are required")
        }

        console.log('printig the user : ',req.currSupplier);
        const suppID = req.currSupplier.supp_id;

        const addedProduct = await addProduct(suppID,prodName,price,category,description);

        res.status(201).json(addedProduct);
    }
    catch(err){
        console.log("Error in adding product (post method)");
    }
}) 

app.post('/addOrder',auth.authorizeUser,async(req,res)=>{
    try{
        const userID = req.currUser.user_id;

        //from this user ID find corresponding cart and directly add it to order
        await addOrder(userID);
        res.status(201).send();
    }
    catch(err){
        console.log(err);
    }
})

app.get('/getAllProducts',auth.authorizeSupplier,async(req,res)=>{
    try{
        const products = await Product.find();
        return res.status(200).json({products});
    }
    catch(err){
        console.log(err);
    }
})

app.put('/updateProduct/:productID',auth.authorizeSupplier,async(req,res)=>{
    try{

        //all new values will be given through body
        const {prodName,price,category,description} = req.body;

        //IMP : Pass productID through params
        const {productID} = req.params;

        //take supplier ID from currSupplier
        const suppID = req.currSupplier.supp_id;

        //Pass all the required arguments to update function
        const updatedProduct = await updateProduct(suppID,productID,{prodName,price,category,description});

        res.status(200).json({updatedProduct});
    }catch(err){
        console.log(err);
    }

    
})

app.delete('/deleteProduct/:productID',auth.authorizeSupplier,async(req,res)=>{
    const suppID = req.currSupplier.supp_id;

    const {productID} = req.params;

    await deleteProduct(suppID,productID);
    res.status(204).send()
})

app.post('/addToCart',auth.authorizeUser,async(req,res)=>{
    try{
        const userID = req.currUser.user_id;
        const {productID,quantity} = req.body;

        const addedToCart = addToCart(userID,productID,quantity);


        res.status(200).json(addedToCart);
    }
    catch(err){
        console.log(err)
    }
})

app.get('/getCurrentCart',auth.authorizeUser,async(req,res)=>{
    const userID = req.currUser.user_id;
    console.log('got my userID',userID);
    let currentCart = await MyCart.findOne({userID:userID});

    if(!currentCart){
        res.status(400).json({msg:"cant find cart"});
    }
    console.log('got my cart',currentCart);

    const plainCart = currentCart.toObject();
    res.status(201).json(plainCart);
})

app.delete('/deleteFromCart/:productID',auth.authorizeUser,async(req,res)=>{
    const userID = req.currUser.user_id;
    const {productID} = req.params;

    await deleteFromCart(userID,productID);
    res.status(204).send()
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

app.get('/searchByFilter',async(req,res)=>{
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


app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})
  
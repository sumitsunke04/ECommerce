const User = require("../Models/User")
const Supplier = require('../Models/Supplier')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

exports.registerUser = async(req,res)=>{
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
}

exports.loginUser = async(req,res)=>{
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
                    expiresIn:"1d",
                }
            )
            res.cookie("jwt",token,{httpOnly:true,secure:true,maxAge:60000*24*60})
            user.token=token;
            console.log("logged in successfully",user)
            return res.status(200).json(user);
            
        }
        return res.status(400).send("Invalid Credentials")
       }
       catch(err){
            console.log(err);
       }
}

exports.registerSupplier = async(req,res)=>{
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
}

exports.loginSupplier = async(req,res)=>{
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
                    expiresIn:"1d",
                }
            )
            res.cookie("jwt",token,{httpOnly:true,path:'/',secure:true,maxAge:60000*24*60})
            supplier.token=token;
            console.log("logged in successfully",supplier)
            return res.status(200).json(supplier);
            
        }
        return res.status(400).send("Invalid Credentials")
       }
       catch(err){
            console.log(err);
       }
}

exports.logout = async(req,res)=>{
    console.log('logging out')
    try{

        console.log(res);
        console.log(res.cookies);
        res.clearCookie("jwt", {httpOnly:true,secure:true,path:'/'})
        res.status(200).json({message:"token deleted"});
    }
    catch(err)
    {
        res.status(500).json({mess:"internal server error"})
    }
}
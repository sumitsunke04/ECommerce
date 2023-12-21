const jwt = require('jsonwebtoken')
const config = process.env;

const authorizeSupplier = async(req,res,next)=>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies.jwt;

    if(!token){
        return res.status(403).send("A token is required for authentication")
    }
    try{
        const decoded = jwt.verify(token,config.TOKEN_KEY);
        req.currSupplier = decoded;
    }
    catch(err){
        return res.status(401).send("Invalid Token");
    }
    return next();
}

const authorizeUser = async(req,res,next)=>{
    const token = req.cookies.jwt;

    if(!token){
        return res.status(403).send("A token is requiredfor authentication");
    }
    try{
        const decoded = jwt.verify(token,config.TOKEN_KEY);
        req.currUser = decoded;
    }
    catch(err){
        return res.status(401).send("Invalid token");
    }
    return next();
}

module.exports = {authorizeSupplier,authorizeUser};
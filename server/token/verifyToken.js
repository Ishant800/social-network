const jwt = require("jsonwebtoken")
exports.verifyToken=(req,res,next)=>{
try {
    
    //extract token from header
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({
        success:"failed",
        message:"Acess denied. No token provided"})
        }

        //format bearer token
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({
                sucess:false,
                message:"Invalid token format"
            })
        }

        //verify token
        const decode = jwt.verify(token,process.env.SECRETE_KEY)

        //attach user info to request
        req.user = decode;
        next();

} catch (error) {
    if(error.name === "TokenExpiredError"){
        return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
    }

     if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
}
}
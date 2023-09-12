
const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ success: false, message: "Token is expired" });
    } else {
        
        jwt.verify(req.headers.authorization, process.env.JWT_PRIVATEKEY, function (err, decoded) {
            if (decoded) {
                req.user = decoded
                next();
            }else{         
            return res
        .status(401)
        .json({ success: false, message: "Token is expired" });
    }
        });
      
    }

}

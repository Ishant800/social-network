const jwt = require("jsonwebtoken")
// token generate 
exports.generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email
    }, process.env.SECRETE_KEY, { expiresIn: '7d' })
}
const User = require("../models/auth.entity")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

//signup controller
exports.createUser = async (req, res) => {
    try {
        const { email, name, password } = req.body
        if (!email || !name || !password) return res.status(400).json({ "error": "all fields are required" })
        
        //validation 
        const userExists = await User.findOne({ email: email })
        if (userExists) return res.status(400).json({ "message": " user already exists" })

        const hashedpassword = await bcrypt.hash(password,8)
        const user = await User.create({
            name,
            email,
            password: hashedpassword
        });
        if (!user) return res.status(501).json({ "error": "failed to create user" })
        return res.status(201).json({ "message": "user created sucessfully", user })
    } catch (error) {
        return res.status(501).json("internal server error")
    }
};

 
//sign in controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ "error": "all fields are required" })

        const userExists = await User.findOne({ email: email })
        if (!userExists) return res.status(400).json({ "message": " user not exists, please create your account." })

        const pm = await bcrypt.compare(password, userExists.password)
        if (!pm) return res.status(400).json({ "error": "password not matched" })

        return res.status(200).json({ "sucess": "ok", "message": "login sucessfully" })
    } catch (error) {
        return res.status(501).json("internal server error")
    }
};

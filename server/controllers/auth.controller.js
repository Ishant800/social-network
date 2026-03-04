const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const { generateToken } = require('../utils/token.util');

// signup controller
const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'all fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: ' user already exists' });
    }

    const hashedpassword = await bcrypt.hash(password, 8);
    const user = await User.create({
      name,
      email,
      password: hashedpassword,
    });
    if (!user) {
      return res.status(501).json({ error: 'failed to create user' });
    }

    return res.status(201).json({
      message: 'user created sucessfully',
      token: generateToken(user),
    });
  } catch (error) {
    return res.status(501).json('internal server error');
  }
};

// sign in controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'all fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: ' user not exists, please create your account.' });
    }

    const pm = await bcrypt.compare(password, userExists.password);
    if (!pm) {
      return res.status(400).json({ error: 'password not matched' });
    }

    const token = generateToken(userExists);

    return res.status(200).json({
      sucess: 'ok',
      message: 'Login sucessfully',
      token,
    });
  } catch (error) {
    return res.status(501).json('internal server error');
  }
};

module.exports = { createUser, login };

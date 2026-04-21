const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.SECRETE_KEY;
const TOKEN_EXPIRES = process.env.JWT_EXPIRES || '7d';


function generateToken(id) {
  return jwt.sign(
    {
      id: id
      
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES }
  );
}



function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,

};
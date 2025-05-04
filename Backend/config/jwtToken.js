const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({   id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" }); // sign - JWT token create pannum.
};

module.exports = { generateToken };


/*
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }); // sign - JWT token create pannum.
};

module.exports = { generateToken };



*/


/*


jwt.sign() — JWT token create pannum.

{ id } → Token la encrypt panna user info (usually user ID).

process.env.JWT_SECRET → Server la secret key — ithu iruntha than token verify panna mudiyum.

{ expiresIn: "1d" } → Token validity: 1 day (24 hours) ku expire aagum.



*/
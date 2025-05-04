const User = require("../models/userModel");
//in here we willvwrify the JWT token, here we will check the user is the admin or not
//Login panna user yaaaru? Authentic person ah illa ya?
//ithu server ku theriyanuma — atha thaan Token verification la check pannuvom.
const jwt = require("jsonwebtoken"); // JWT token ah verify panna.
const asyncHandler = require("express-async-handler");

// Client request Authorization header la token send pannirukka check pannuthu.
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) { // Server la request vandha udane, headers.authorization la Bearer keyword check pannum.
                                                           // Ithu irundha, athu JWT token nu server understand pannum.

    token = req.headers.authorization.split(" ")[1]; // Header la irukkura JWT token ah extract pannuthu.

    try {
      if (token) {
        //Token iruntha, JWT secret key use panni token valid ah check pannuthu.
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //Token decode panni user id eduthu, database la user ah theduthu edukkuth
        // console.log(decoded);
        const user = await User.findById(decoded?.id); //decoded la token la encode pannirukka user info (id, email, expiry) varum.
        req.user = user; //req.user na — Login panna user oda full data.
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized token expired,Please Login again");
    }
  } else {
    throw new Error("There is no token attached to header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
   console.log(req.user)
  //authMiddleware la user oda details req.user la save pannirukkom.
  //Andha user kitta irukkura email ah eduthukkirathu.
  //console.log(req.user)
  const { email } = req.user;
  const adminUser = await User.findOne({ email }); //Database la poi, andha email irukkura user record ah thedukkirathu.
//If email match aana user irundha — adminUser variable la store aagum.


  if (adminUser.role !== "Admin") {
    throw new Error("Your are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };

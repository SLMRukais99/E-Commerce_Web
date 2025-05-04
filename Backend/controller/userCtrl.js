const User = require("../models/userModel"); //usermodela import panram
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");

const asyncHandler = require("express-async-handler"); //package install pannathu
const { generateToken } = require("../config/jwtToken"); //importying anka exprot panna jwT token
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const { createPasswordResetToken } = require("../models/userModel");

// Create a User --------------------------------------------------------------------------------------
//routerla /register ithuku pakkathla comma potu, createUser ena kututha thane athenalathan inka varum
// model ta base panni ithe create panni antha model moolamaha database la searkum
const createUser = asyncHandler(async (req, res) => { //async antathe vitutu asyncHandler use panranka, why
  /**first sihnup pannaka api/user/register anka kutuka ka varamail...req ku varum
   * TODO:Get the email from req.body // try catch potu seirathu ku pathilaha async handler use panna simple aha seiyelam, error vanthal athu next(error) moolam athu vanthu errorHandler middleware kku pohum
   */
  const email = req.body.email;
  /**
   * TODO:With the help of email find the user exists or not
   */
  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    /**
     * TODO:if user not found user create a new user
     */
    const newUser = await User.create(req.body);//post tan inka intha fucntion moolam usera create panram  // இந்த method-ல் save() method internal-ஆ call ஆகுது! 👉 அதனால்தான் pre("save") middleware trigger ஆகுது., pre save user modela iruku
     /*{ ituthan antha req.body aha irukum
    {
      "firstname": "Arun",
      "lastname": "Kumar",
      "email": "arun@example.com",
      "mobile": "9876543210",
      "password": "mypassword"
    }  
    }
  */
    res.json(newUser); // intha line moolam than client ku / forntent llu response varum, apa await User.create(req.body); intha line moolam than data databse kuu save ahura
  } else {
    /**
     * TODO:if user found then thow an error: User already exists
     */
    throw new Error("User Already Exists");
  }
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {  //antha url kkuriya error hal throw ahum intha fucntion halukkulla than
  const { email, password } = req.body;// ithu type panna password API moolam
  //console.log(email, password) //to print the output
 
  // check if user exists or not
  const findUser = await User.findOne({ email }); //finduser entu varathu database la iruthu hash panna password and all detailayum tharum, const { email, password } = req.body; ithula irunth vantha email than database la iruthu data etuka use panram
 
  if (findUser && (await findUser.isPasswordMatched(password))) { //(password) ithuthan login la type panna password , const { email, password } = req.body;
    const refreshToken = await generateRefreshToken(findUser?._id); //refresh token generte avura
    const updateuser = await User.findByIdAndUpdate( //generate panna antha tokena store panram databasela
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );

    res.cookie("refreshToken", refreshToken, { //res.cookie() is used to store the refresh token in an HTTP-only cookie.
      httpOnly: true, //httpOnly: true ensures that the cookie cannot be accessed by client-side JavaScript (for security reasons).
      maxAge: 72 * 60 * 60 * 1000, //maxAge: 72 * 60 * 60 * 1000 sets the cookie expiration time to 3 days.
    });


    res.json({ //ithuthan login pannanka response ava pora ok
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      role: findUser?.role,//ithu poravu add pannathu
      token: generateToken(findUser),
  //   token: generateToken(findUser?._id), //ithutahn access token pola, in tha ID tahn jwt.js kku pass ahutu, itheutaha than access token create entu ninaikan
   //Ithu JWT Access Token generate panni client-ku send pannum.
   // Access Token — database-la store panna maatanga!
    //Ithu server res.json() moolama client-ku response-a send pannum.
    });
  } 
  else {
    throw new Error("Invalid Credentials");
  }
});

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "admin") throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token
//we are getting a refresh token from cookies
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });//ithenoodaha database la ulla datavarum
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) { //dtabasela ulla data than user, so athu ta id um decode panrathala vaa id m equal ah ena check panram
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden, inka appdi oru usera already illa enbathala antha kalla cookieya delte panram
  }
  await User.findOneAndUpdate({ refreshToken: refreshToken }, {
    refreshToken: "", //user irunthal refresh tokena empty akitu
  });
  res.clearCookie("refreshToken", { //refreshtokena databasel empty pannitam, ipa delete panram antha cookieya
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user; // Ithu login panni irukkira user-oda MongoDB id.
  /*
For the following reason req.use use pana
req.user = {
   _id: "65218d1238fc9ab9df98bfe7",
   firstname: "Arun",
   email: "arun@example.com",
   role: "user"
}
URL or req.body la id send panna thevai illa.

Already token-la irukkira valid user information-la irundhu req.user set pannirukkum.

So hackers manually id guess panna chance kammi.

so req.params use panna thevalla ok


  */
  //first we ewill verify the user, then we will get the user from request, not ffrom params 
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname, //api la irunthu update pannaka body la kutukura datakal athe mango db la ulla variable kku update panram
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile, //matah field lam databasela irukurathu than keep pannum
      },
      {
        new: true,  //update datave return pannum
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {    //router.get("/all-users", getallUser);
  try {
    const getUsers = await User.find().populate("wishlist");
    res.json(getUsers);//ithu than request pannai API kku respons aha pohum
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {   //http://localhost:5000/api/user/67a0888c063e782c78964baf, userkku ankala irukura id than req.params ok athe vaanka than appidi use panra

  const { id } = req.params;
  validateMongoDbId(id); //MongoDB ID valid ah irukka check pannum. Invalid ID irundha — error throw pannum.



  try {
    const getaUser = await User.findById(id); // meluku vaankina id than ithukulla kutukuram
    res.json({
      getaUser,  //ithuthan API kku response aha pohum ok
    });
  } catch (error) {
    throw new Error(error);
  }
});

// delete a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id); //intha fiunction delte pannuthu and delete panan data ve deleteUser store pannuthu based on the id
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//Block a User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate( //DB-la irukkira user-a id based-a thedi update pannum.
      id,
      {
        isBlocked: true, // user block panna set panniranga.
      },
      {
        new: true, //update aana latest user object return panna solrathu.
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});


//http://localhost:5000/api/user/password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user; //with the help of this ID we will update the user, 
  const { password } = req.body; // req.body la irunthu password etupom, user update pannaka, urla irunthu thane
  validateMongoDbId(_id);
  const user = await User.findById(_id);//ithu database la ulla antha id kkuriya data
  if (password) {
    user.password = password;//inkathan update ahutunthat password
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

//passwort forgot pannalta ithu varume email intha request la
//Forgot password process-ku user-ku reset link mail panna help pannuthu.
//http://localhost:5000/api/user/forgot-password-token, intha API click pannathan intha function kku varum
//<a href='http://localhost:3000/reset-password/${token}'>Click Here</>`; - ithu reset password code, ithuku innam eluthala


const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;//apila vara email receive pannuthu
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken(); //it will reurn our token, inkathan call ahuthu user modela ulla createpasseordresenttoken function, usermodel.js la iruu intha funcion

    await user.save(); //after generating token we are saving pur user, //Because namma token ah user object la add pannirukom.
    console.log(token);
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</>`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL, //ithula potuirukam antha resetURL, html file enbathal htm use panra
    };
    sendEmail(data);//inkthan send email call ahuthu
    res.json(token);//tokena than respose aha anupuram
  } catch (error) {
    throw new Error(error);
  }
});

/* 
{
  "_id": "6662bd2308416b7fc9f7b99a",
  "firstname": "John",
  "email": "john@gmail.com",
  "mobile": "9876543210",
  "passwordResetToken": "8ed99acdd6487f7b75f7e69e6f4c57790bbf07f345b28f",
  "passwordResetExpires": "2025-05-15T09:45:00.000Z"
}
*/

/*
Short ah:
Token generate —> Hash panna —> DB la save
Normal token —> Email la anupu
*/



//<a href='http://localhost:3000/reset-password/${token}'>Click Here</
//meluku crypto package import panna ventum
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body; //User frontend la password type panni anupuvanga.
  const { token } = req.params; //URL params la (like /reset-password/:token) token pass aagum.
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");//Token hash pannuvom
  const user = await User.findOne({//Database la hashedToken match panna user-a find pannuvom. 
    passwordResetToken: hashedToken, //with the help of the password reset token, we can find our user. user midela password reset token nu define panni irukam
    passwordResetExpires: { $gt: Date.now() },//antha token exipires ahame irunthal mattum than find panna ventum antha usera
    /*
Database la hashedToken match panna user-a find pannuvom.

Same time la expiry date check pannuvom ($gt = greater than).

i.e., token still valid irukkanum (expired aagakoodathu).
    */
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;//Reset token and expiry fields remove pannuvom (undefined set pannuvom).
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});
/*
🔥 Inga enna nadakuthu:
user.save() panna pothu,

pre('save') hook call aagum automatically.

if (!this.isModified('password')) → Password field modify pannala na skip pannum.

Modify panniruntha,
👉 bcrypt use panni hash panni,
👉 hashed password-ai DB ku save pannum.




*/






const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { productId, color, quantity, price } = req.body;

  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let newCart = await new Cart({
      userId: _id,
      productId,
      color,
      price,
      quantity,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ userId: _id })
      .populate("productId")
      .populate("color");
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId } = req.params;
  validateMongoDbId(_id);
  try {
    const deleteProductFromcart = await Cart.deleteOne({
      userId: _id,
      _id: cartItemId,
    });

    res.json(deleteProductFromcart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const deleteCart = await Cart.deleteMany({
      userId: _id,
    });

    res.json(deleteCart);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      userId: _id,
      _id: cartItemId,
    });
    cartItem.quantity = newQuantity;
    cartItem.save();
    res.json(cartItem);
  } catch (error) {
    throw new Error(error);
  }
});

const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    totalPrice,
    totalPriceAfterDiscount,
    paymentInfo,
  } = req.body;
  const { _id } = req.user;
  try {
    const order = await Order.create({
      shippingInfo,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      paymentInfo,
      user: _id,
    });
    res.json({
      order,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find({ user: _id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const orders = await Order.find().populate("user");
    // .populate("orderItems.product")
    // .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getsingleOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findOne({ _id: id })
      .populate("user")
      .populate("orderItems.product")
      .populate("orderItems.color");
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await Order.findById(id);
    orders.orderStatus = req.body.status;
    await orders.save();
    res.json({
      orders,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getMonthWiseOrderIncome = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          month: "$month",
        },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});

const getYearlyTotalOrder = asyncHandler(async (req, res) => {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let d = new Date();
  let endDate = "";
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = monthNames[d.getMonth()] + " " + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        amount: { $sum: 1 },
        amount: { $sum: "$totalPriceAfterDiscount" },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  createOrder,
  getMyOrders,
  emptyCart,
  getMonthWiseOrderIncome,
  getAllOrders,
  getsingleOrder,
  updateOrder,
  getYearlyTotalOrder,

  removeProductFromCart,
  updateProductQuantityFromCart,
};

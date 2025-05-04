const express = require("express");
const {
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
  removeProductFromCart,
  updateProductQuantityFromCart,
  getMyOrders,
  emptyCart,
  getMonthWiseOrderIncome,
  getMonthWiseOrderCount,
  getYearlyTotalOrder,
  getAllOrders,
  getsingleOrder,
  updateOrder,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { checkout, paymentVerification } = require("../controller/paymentCtrl");

const router = express.Router();//mukkiyamane line
router.post("/register", createUser); //http://localhost:5000/api/user/register, user create pantra logic user controller la iruku, inth route moolam than create panra antha createUser enkura usercontroller kku pohuthu, register than signup

router.post("/forgot-password-token", forgotPasswordToken); //http://localhost:5000/api/user/forgot-password-token

router.put("/reset-password/:token", resetPassword);//href='http://localhost:3000/reset-password/:token, ithu put

router.put("/password", authMiddleware, updatePassword);//with the help authmiddleware we can get the req.user 3.45 intha video la const{_id} illame we cant find the user.
//Unauthorized person password change panna mudiyadhu. only login avi iruntha user maatum than change panna mudium, 
//All routes with authMiddleware MUST have JWT token added in Postman Authorization tab — without it, server can’t know who you are! 🛡️




router.post("/login", loginUserCtrl);// ithu vanthu login uriyathu http://localhost:5000/api/user/login
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/order/checkout", authMiddleware, checkout);
router.post("/order/paymentVerification", authMiddleware, paymentVerification);

router.post("/cart/create-order", authMiddleware, createOrder);
router.get("/all-users", getallUser);// ellaa userm vara
router.get("/getmyorders", authMiddleware, getMyOrders);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.get("/getaOrder/:id", authMiddleware, isAdmin, getsingleOrder);
router.put("/updateOrder/:id", authMiddleware, isAdmin, updateOrder);

router.get("/getMonthWiseOrderIncome", authMiddleware, getMonthWiseOrderIncome);
router.get("/getyearlyorders", authMiddleware, getYearlyTotalOrder);

router.get("/refresh", handleRefreshToken); //rferesh tokenukkanathu

router.get("/logout", logout); //logout kkanathu
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);

router.get("/:id", authMiddleware, isAdmin, getaUser); //get a user - http://localhost:5000/api/user/67a0888c063e782c78964baf
//ony admin mattum than sensitive usera parka venum, mathakal parka koota, intha ithula admin thane check panra user ota id a potu user ota datave etukura admin, so in here admin ta authorize token than use pannuvom athenalao theriya isADmin potura, admin aha irunthal than mattum enbathukaha

router.delete("/delete-product-cart/:cartItemId", authMiddleware, removeProductFromCart);

router.delete("/update-product-cart/:cartItemId/:newQuantity", authMiddleware, updateProductQuantityFromCart);

router.delete("/empty-cart", authMiddleware, emptyCart);

router.delete("/:id", deleteaUser);  //delete a user

router.put("/edit-user", authMiddleware, updatedUser); //usera edit panna
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser); //only admin can block the user
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);//only admin can unlbock user athenalathan isAdmin potura ok

module.exports = router;

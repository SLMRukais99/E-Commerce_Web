const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
} = require("../controller/productCtrl");

const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");//auth middelware import panni iruku antha 2 varaiablayum use panna
const router = express.Router();

router.post("/",  createProduct);

router.get("/:id", getaProduct); //oru product get panna
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

router.put("/:id", authMiddleware, isAdmin, updateProduct);//ithu vanthu update pannanum producta , ithu vanthu admin thn seira
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);//admin tane delete panna ventum

router.get("/", getAllProduct); //ella product etuka, route eppidum kutukalam

module.exports = router;

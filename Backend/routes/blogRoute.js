const express = require("express");
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  liketheBlog,
  disliketheBlog,
  uploadImages,
} = require("../controller/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { blogImgResize, uploadPhoto } = require("../middlewares/uploadImage");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBlog);// only admin can create the blog
router.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImgResize,
  uploadImages
);
router.put("/likes", authMiddleware, liketheBlog);  //ithu update blog kku munnuku potanum illati error
router.put("/dislikes", authMiddleware, disliketheBlog);

router.put("/:id", authMiddleware, isAdmin, updateBlog); //update a blog



/*
Fixed routes always TOP la define pannanum.

Dynamic routes always LAST la define pannanum.

Because dynamic route will catch any value if no match found.

Route	                 Fixed/Dynamic
/likes	               Fixed
/dislikes           	  Fixed
/create	               Fixed
/:id	                 Dynamic
/product/:productId	   Dynamic
/user/:username	     Dynamic
*/

router.get("/:id", getBlog); //get a blog
router.get("/", getAllBlogs);

router.delete("/:id", authMiddleware, isAdmin, deleteBlog); //only admin can delete a blog

module.exports = router;

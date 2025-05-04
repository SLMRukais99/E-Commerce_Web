const Blog = require("../models/blogModel");
const User = require("../models/userModel");
/*
User model ah import panraanga.
Appo database la irukura Users table/model (MongoDB collection) access panna mudiyum.

Example:
Login user details venumna (req.user._id vachi),
Blog like/dislike panrathula user info check pannrathukku,
Populate pannumbothu (populate("likes")) user details venumna,
User model thevai padum.
➡️ Simple ah:
User related data fetch/update panna User model import panni irukaanga.
*/
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
/*
Idhu oru utility function.
MongoDB la irukkura id ellam oru special format la irukum (24 character hexadecimal string).
Example: 649bfe7a2fc13bb4c8f5a256
Sometimes id wrong ah irundha (missing/extra character na), MongoDB query fail aagum.
So, safety kaaga idha validate pannuvanga first.
validateMongoDbId(id) nu call pannumbothu,
Valid id a illa check pannum,
Invalid na Error throw pannum, appo next process nadaka matthu.
➡️ Simple ah:
MongoDB id correct format la iruka check panna validateMongoDbId use panni irukaanga.
*/




const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");


//used to create a blog through post menthod
const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);
  } catch (error) {
    throw new Error(error);
  }
});



const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateBlog);
  } catch (error) {
    throw new Error(error);
  }
});


//get a blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;// URL la irundhu blog id eduthuranga
  validateMongoDbId(id); // id correct format la iruka check panraanga
  try {
    // Blog fetch panraanga
    const getBlog = await Blog.findById(id)
      .populate("likes") //// Likes la iruka user ids ah user details ah mathraanga
      .populate("dislikes");  //// Dislikes la iruka user ids ahum same
/*
findById use pannina, likes and dislikes field-la just user ID mattum varum.

Example:

json
Copy
Edit
likes: ["userId1", "userId2"],
dislikes: ["userId3"]
populate("likes") panna, andha user ID oda full user details varum.

Example:

json
Copy
Edit
likes: [
  { _id: "userId1", name: "Raj", email: "raj@gmail.com" },
  { _id: "userId2", name: "Kumar", email: "kumar@gmail.com" }
]

*/


    //    // Blog ah oruthan view panna, numViews +1 panna
    const updateViews = await Blog.findByIdAndUpdate(
      id,
      { //APi ovvruka click panna itu update ahum
        $inc: { numViews: 1 }, //// MongoDB operator: increment 1 //$inc MongoDB operator use pannirukaanga → increment pannudhu.
      },//numViews nu dbla field iruku, u can see in the model, so naame update panram antha field ta
      { new: true }
      //With { new: true }:
      //Update pannina apparam — updated document ah return pannum.

      /*
      "Ovvora call panna update aaguma?"
      (Every time API call panna numViews update aaguma?)
      Answer: YES! ✅
      Oru blog view API (i.e., getBlog API) ku one call pannumbothu,
      Idhula irukkura findByIdAndUpdate execute aagum,
      Andha blog oda numViews 1 increase aagum.
      */
    );
    // // Blog details client ku anupuraanga
    res.json(getBlog);
  } catch (error) {
    throw new Error(error);
  }
});


//To get all blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const getBlogs = await Blog.find();
    res.json(getBlogs);
  } catch (error) {
    throw new Error(error);
  }
});


//Delete a Blog
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    res.json(deletedBlog);
  } catch (error) {
    throw new Error(error);
  }
});



//➡️ Oru user, oru blog-ah like panna / like remove panna handle panrathu.
const liketheBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body; //blog id than varum put methodla
  validateMongoDbId(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);//blog id ya vachu antha blog etukuram
  // find the login user
  const loginUserId = req?.user?._id; //only login user like and dislike, with the help of auth middleware we will get our login user
  // find if the user has liked the blog
/*
Meaning:
User login aagiyiruntha, req.user la login user details irukkum.
Avanoda ID ah eduthutu, loginUserId la store panrom.
Auth middleware la token verify pannitu req.user la save pannirupom.
✅ Use:
Current login user yaru nu identify panna.

*/

  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
/*
Meaning:
Blog document la irukkura isLiked property ah read panrom.
isLiked = true/false
✅ Use:
Blog already like panniruka user?
If true → Already liked
If false → Not liked
*/

/*
✅ Global blog oda isLiked property pathi check pannitu remove panringa.
But that's wrong because:
One user like pannirundhalum, isLiked = true irukum.
Ana innoru user like pannirukalaya nu paakaliye?

const alreadyLiked = blog?.likes?.find(
  (userId) => userId?.toString() === loginUserId?.toString()
);

if (alreadyLiked) {
  // Remove like
} else {
  // Add like
}
*/



  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  /*
Blog la irukkura dislikes array la search panrom:
userId === loginUserId match aagutha nu. //true pr false than return pannum
find() function first matching user ID ah return pannum.
✅ Use:
Check pannurathu:
"Login user already dislike pannirukana?"
  */



  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate( //blog - ithu small enna name nalum kutukalam
      blogId,
      {
        $pull: { dislikes: loginUserId },//intha user id anathu pull pannuvathan moola, antha dislikes array la irunthu remove ahuthu
        isDisliked: false, //No need to search array, iveru like dislike panni iukara like panni irukaranu arrayecheck panna vendi avsiyam illa, mainly help for that if function to check whether that person like or not liked
      },
      { new: true }
    );
    res.json(blog);
  }

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },// //$pull = "Array la specific data remove pannu"., likes array la irukkura loginUserId value ah remove pannu.
        /*
        Suppose unga database Blog document la irukku:
     {
    "title": "How to learn Node.js",
    "likes": ["user1", "user2", "user3"],
    "dislikes": []
     }
     Neenga user2 login panni "Unlike" button click panna:

     $pull: { likes: "user2" }
     Result:
     After $pull, likes array update aagum like this:
    {
   "likes": ["user1", "user3"]
     }
        */
        isLiked: false, //yenkanavae like panni iruntha flase panram, like etukuram,Super fast check. if la potu check pannaka use ahuthu, specialy for fast operation
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId }, 
        isLiked: true, // yetkanave like pannati like panram
      },
      { new: true }
    );
    res.json(blog);
  }
});








const disliketheBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isDisLiked = blog?.isDisliked;
  // find if the user has disliked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId }, //$pull = "Array la specific data remove pannu"., likes array la irukkura loginUserId value ah remove pannu.
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});









const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log(newpath);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );
    res.json(findBlog);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  liketheBlog,
  disliketheBlog,
  uploadImages,
};

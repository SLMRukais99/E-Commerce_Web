const Product = require("../models/productModel"); //ok
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler"); //ok
const slugify = require("slugify");//Usually used for: URL-friendly text create பண்ண
const validateMongoDbId = require("../utils/validateMongodbId");


//create user mari create product //ithuthan /- slash kku uriyathu
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {//api la irunthu title etukam
      req.body.slug = slugify(req.body.title); //antha title user kku url kku yethamari set ahuthu athuu than slug use panra
    }
    const newProduct = await Product.create(req.body); //req.body enkurathu object thane athe vachu kondu oru newProduct create ahuthu
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//Update Product
const updateProduct = asyncHandler(async (req, res) => {//apila kututhu update panram oru datave
  const { id } = req.params; //அந்த URL-ல இருக்குற id தான் இத. PUT /api/product/661c947ddbcd48d198d87b7b
  validateMongoDbId(id); //MongoDB ObjectId valid-ஆ இருக்கிறதா இல்லையா check பண்ணும்.

  try {
    if (req.body.title) {//req.body.title true aha iruntha ulluku va
      req.body.slug = slugify(req.body.title);
    }
    /*
    Product.findByIdAndUpdate() →
    id-க்கு match ஆகுற Product-ஐ update பண்ணும்.
    req.body → Client-ன் request-ல இருந்த data-வ update பண்ணும்.
    { new: true } → Update ஆன new document-ஐ return பண்ணும்.
    */
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});


//To delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    res.json(deletedProduct);
  } catch (error) {
    throw new Error(error);
  }
});


//get a product
const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById(id).populate("color");//api la vantha id, that will be product id, color tablelayum include panram poulate moolamaha ithuka
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

//getting all product

//ithu summa just simple ana code for ella thukum to get
/*
const getAllProduct = asyncHandler (async(req,res)=> {
  const {id} = req.params;
  try{
    const findProduct = await Product.findById(id);
    res,json(findProduct); //ithuthan respond aha pora
  }catch(error){
    throw new Error(error);
  }
});
*/

//ithu summa ippidium seiyalam, ithu vanthu advance filtering illa to get product
//http://localhost:5000/api/product?brand=HP
/*
const getAllProduct = asyncHandler(async(req,res) => {
  try {
    const getAllProducts = await Product.find(req.query);
    res.json(getAllProducts);
  }catch(error){
    throw new Error(error);
  }
});
*/


//Another way summa
//http://localhost:5000/api/product?brand=HP&category=watch
/*
const getAllProduct = asyncHandler(async(req,res) => {
  try {
    const getAllProducts = await Product.find({
    brand: req.query.brand,
    category: req.query.category,
    });
    res.json(getAllProducts);
  }catch(error){
    throw new Error(error);
  }
});
*/

//Another way summa
//http://localhost:5000/api/product?brand=HP&category=watch
/*
const getAllProduct = asyncHandler(async(req,res) => {
  try {
    const getAllProducts = await Product.where("category").equals(req.query.category);
    res.json(getAllProducts);
  }catch(error){
    throw new Error(error);
  }
});
*/

//main way to get product all
const getAllProduct = asyncHandler(async (req, res) => {
 // console.log(req.query)


 //http://localhost:5000/api/product?brand=HP, capital small issue iruku inth HP la ok
 //http://localhost:5000/api/product?brand=HP&color=red
 // http://localhost:5000/api/product?price[gte]=100
 //http://localhost:5000/api/product?price[gte]=12500&price[lte]=42000
  try {
    // Filtering
    const queryObj = { ...req.query };//query object la antha params than irukum  //req.query la irukura all params (like price[gte], brand, sort, page, etc.) copy pannuvom.
    const excludeFields = ["page", "sort", "limit", "fields"]; // intha filed hala exculde pannanum, athukakaha athe oru variable la store panram
    excludeFields.forEach((el) => delete queryObj[el]); //here exclude panna filed hala queryobj la irunthu delete panram
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);//ihula or gate use pannuvathal ontuthan pohum
    //"apple".replace("a", "b") ➝ "bpple"
    //You're replacing 'a' with 'b'
    //here iovvontukum munnukum $ ithe add panram, athe than mangi db yethukumam
    let query = Product.find(JSON.parse(queryStr));


/*
    //ippidium sort pannala summa just understanding kku
    if (req.query.sort) {

      query = query.sort("category brand"); //ithe than keelukulla vary piriluth       const sortBy = req.query.sort.split(",").join(" ");
    } else {
   
    }
*/

    // Sorting
  //http://localhost:5000/api/product?sort=category,brand
  //http://localhost:5000/api/product?sort=-category,brand
    if (req.query.sort) { //category um brand m varum // Check if user sent sort in query param.
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");//time kku yethamari sort ahuthu
    }


/*
sort=price	Price ↑ (Low to High)
sort=-price	Price ↓ (High to Low)
sort=createdAt	Oldest first
sort=-createdAt	Newest first
*/


    // limiting the fields 
    //Apila last ah -v iruku , athu mango ta internal operation kku athe user kku katanum nu avasiyam illa
    //http://localhost:5000/api/product?fields=title,price,category
    //http://localhost:5000/api/product?fields=-title,-price,-category , -potal antha field thavira micha ella field um varum with __v ota, becayse in ka if statemental fields true entu check avitu
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields); //url la vaara field mattum dispay ahum ok
    } else {
      query = query.select("-__v");//- potuvathal intha - potura field select ahathu, rxclude
    }

    // pagination  = in one page how many product we can show
    // http://localhost:5000/api/product?page=1&limit=3
    //page → which page user wants (1, 2, 3...)

     //limit → how many items to show per page


    const page = req.query.page; //anka pagela kututha value varum
    const limit = req.query.limit; //limitla kututha value varum
    const skip = (page - 1) * limit; //codela iruku explanation, skip enbathu 0 index la irunthu ithuna datave skip pannuthunu artham
   // console.log(page, limit, skip);
    query = query.skip(skip).limit(limit); //skip function used to skip the data before that index
    if (req.query.page) { //Check if the page exists
      /*
      countDocuments() → total product count in DB
      skip >= productCount → example:
      If you have 6 products total, and you skip 9 → invalid!
      So this condition prevents invalid page numbers ❌
      */

      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This Page does not exists");
    }
    const product = await query;  //Final products list returned as JSON to frontend 
    res.json(product); 
  } catch (error) {
    throw new Error(error);
  }
});




//oru user "enakku pudichathu" nu oru favourite product list maintain panra place
//very very important concept - .find(), .filter(), .map()
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;  //user.id enbathu authmiddleware la irunthu varathuthan, req.user la id mattum ila role email lam irukum , _id ya pota id varum
/*
 Important Point:

If you add in middleware	You can access anywhere after that middleware
Eg: req.user = user (authMiddleware)	Controller la req.user._id access pannuvom , auth miiddleware la irukura intha line moolam than antha user document req. kku add ahuthu, athenala req.user.id nu antha user document ta acces panram
*/

  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);//User enbathu User Model
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId); //already added um object than return pannum
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});








const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
/*
product.ratings → array of ratings objects.

find method → first matching object ah return pannum.
*/
//already rated ippidi than irukum
/*
[
  { star: 4, comment: "Good", postedby: "user111" },
  { star: 5, comment: "Super", postedby: "user222" }
]
*/

    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated }, //inka match ahuthanu parkom, match ahura antha documenta mattum update panra,
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }

    const getallratings = await Product.findById(prodId); //get all rating illa , product than varum antha product la than rating pakuram
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0); //see chatgpt
    let actualRating = Math.round(ratingsum / totalRating); 
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});





module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
};

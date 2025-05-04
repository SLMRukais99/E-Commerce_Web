const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
//Frontend → Multer → Cloudinary Upload → Database Save



//2 vahayana storage , disk storage and memory storage
/*
This code is creating a Multer storage setup to:
Where to save the uploaded image.
What name to give the uploaded image file.
*/
const storage = multer.diskStorage({ //"Save the file to disk (local system) instead of memory or cloud
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));  //destination: Ithu solluthu — "Image file enga save aaganum?"
    
    /*
    __dirname = current folder.
So file save agum: project_folder/public/images/ la.
    */
  },


  /*
➡️ filename: Ithu solluthu —
"File ku enna name vechittu save panradhu?"
  */
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
  },
});



const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

//inka than antha file nammeta saver ku pohuthu, antha public/imag/ folder kka 
const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});





const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
      fs.unlinkSync(`public/images/products/${file.filename}`);
    })
  );
  next();
};







const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blogs/${file.filename}`);
      fs.unlinkSync(`public/images/blogs/${file.filename}`);
    })
  );
  next();
};
module.exports = { uploadPhoto, productImgResize, blogImgResize };

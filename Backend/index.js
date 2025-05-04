const bodyParser = require("body-parser");
const express = require("express"); //
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();//
const dotenv = require("dotenv").config(); //1
const PORT = process.env.PORT || 4000;//x
const authRouter = require("./routes/authRoute");//a
const productRouter = require("./routes/productRoute");//b
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodcategoryRoute"); //ithukuriya category route ta check pannu
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); //kela iruku
/*
 morgan என்பது ஒரு logging middleware.

நம்ம Express.js / Node.js application-ல்,

Client → Serverக்கு request அனுப்பும் போது
எந்த route, எந்த method, என்ன status, எவ்வளவு time எடுத்துச்சு
அப்படின்னு log பண்ணுறதுக்கு தான் morgan-ஐ use பண்ணுறோம்!

*/
const cors = require("cors");
//summa
/*
app.use('/', (req, res)=>{
  console.log(`Hello from server side`);
})
*/

dbConnect();// Connect to the database, inkathan antha ithu connect ahuthu ok
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json()); //ithu mukkiyam api postmanla create pannitu work aha
app.use(bodyParser.urlencoded({ extended: false }));//ithu mukkiyam api postmanla create pannitu work aha
app.use(cookieParser());
app.use("/api/user", authRouter); //a //api/user enbathu auth router aha etuthukum i think so api/user entu kututha athu auth router ahum ok, ippa api/user/register appidina api/user enabthu auth router thane so athula registera parkum ok
app.use("/api/product", productRouter);//b ithuthan productroute ota amapanthamantahu
app.use("/api/blog", blogRouter); //ithu ok
app.use("/api/category", categoryRouter); //ithukuriya code illa ithuthan product category router pola
app.use("/api/blogcategory", blogcategoryRouter); //done
app.use("/api/brand", brandRouter);  //done
app.use("/api/coupon", couponRouter); //done
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);

//middleware pass panna vendum
app.use(notFound);//இதனால் res.status(404) ஆகும்., errorHandler.js la paru under middle ware folder, anka kututha 404
app.use(errorHandler); // Global error handler, // இது 404-ஐ மாற்றாது.

app.listen(PORT, () => {//x
  console.log(`Server is running  at PORT ${PORT}`);
});

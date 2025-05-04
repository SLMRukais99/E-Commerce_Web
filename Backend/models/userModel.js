const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");//install pannathu to encrypt the password
const crypto = require("crypto");//reset panna passord token
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: String,
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],//intha user inthane product save pannirukaru thane parpom, ankayum intha blog ithuna like etuthu iruku nu thane parpom
    refreshToken: {
      type: String,
    },
    passwordChangedAt: Date,  //Stores the token used for refreshing authentication
    passwordResetToken: String,// Timestamp of last password change
    passwordResetExpires: Date, //Used for password reset functionality
  },
  {
    timestamps: true,
  }
);



//password update , reset atuhal seiya muthal iruntha code
/*
userSchema.pre("save", async function (next) { 

 
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) { //lentered password login pannaka type panrathu, mathtahu sinnup or register pannaka type panrathu
  return await bcrypt.compare(enteredPassword, this.password); //if password is correct it is return true otherwise false, ithu user controla login la call ahuthu
};

*/


//usercreate ta data ve save pannitum database la athuku muthal namaku oru sila checking theva thane password visym athukuthan keeluku ulla thu ok
userSchema.pre("save", async function (next) { //user modela Save ஆகும் முன் execute ஆகும் function ithukulla varum
  if (!this.isModified("password")) {  //ithanal than, password field save akame vachu irukum, password field mody pannala ental ulluku vanthu next() method moolam already irukurathu or anupinathu save ahum, appidi illantal keeluku ullathu encrypt natakum ok.
    next();
  }

//signhup pannaka hash ahuthu
  const salt = await bcrypt.genSaltSync(10);//password encryption athuhal
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Password Comparison Function, login ahaka
userSchema.methods.isPasswordMatched = async function (enteredPassword) { //lentered password login pannaka type panrathu, mathtahu sinnup or register pannaka type panrathu
  return await bcrypt.compare(enteredPassword, this.password); //if password is correct it is return true otherwise false, ithu user controla login la call ahuthu
//bcrypt method vanthu entered password ta compare pannum ok
};

//Password Reset Token Generation. 
userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken; //ithuthan userctrl la ulla forget passowrd token kku return pannuthu

  /*
  followig reason alam await user.save() entu userctrl la kutukam
this.passwordResetToken and this.passwordResetExpires na actual user database document field update aaguthu.
  */
}; 

//Export the model
module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
//creating product schema
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    
    sold: {
      type: Number,
      default: 0,
      //select : false //ippidi kutpathal get all product api la intha part varathu, which mean frontend kku hide panram ok
    },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    color: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color" }],
    tags: String,
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    
    totalrating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
  /*
This automatically adds:
createdAt
updatedAt
to every product document — so you know when a product was created or updated.
  */
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
/*

Mongoose model name (Product) → MongoDB-ல் collection name (products) ஆவும்.
(இது Mongoose-ன் naming convention.)



*/


const mongoose = require("mongoose");


const homeSchema = new mongoose.Schema({
  housename: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  image: String,

  description: String,

  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Every home MUST have an owner!
  }
});


module.exports= mongoose.model("Home", homeSchema);

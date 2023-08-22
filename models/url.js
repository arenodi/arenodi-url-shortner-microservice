let mongoose = require("mongoose");

let urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  urlId: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Url", urlSchema);

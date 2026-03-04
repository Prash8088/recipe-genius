const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: String,
  directions: String,
  image: String,
  category: String
});

module.exports = mongoose.model("Recipe", recipeSchema);

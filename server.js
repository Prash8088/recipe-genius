const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Recipe = require("./models/Recipe");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/recipeDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/recipes", async (req, res) => {
  const recipes = await Recipe.find().limit(10);
  res.json(recipes);
});

app.get("/search", async (req, res) => {
  const query = req.query.ingredient;
  const category = req.query.category;

  try {
    const filter = {
      $or: [
        { ingredients: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } }
      ]
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    const recipes = await Recipe.find(filter).limit(20);

    res.json(recipes);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/recipe/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/all-recipes", async (req, res) => {
  try {
    const recipes = await Recipe.aggregate([
      { $sample: { size: 10 } }   // 🔥 Random 10
    ]);

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Auth routes
app.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// add recipe route
app.post("/add-recipe", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.json({ message: "Recipe added successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/update-recipe/:id", async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/delete-old-recipes", async (req, res) => {
  try {
    const result = await Recipe.deleteMany({
      image: { $exists: false }
    });

    res.json({
      message: "Old dataset deleted",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});








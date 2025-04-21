const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  const recipes = await db("recipes");
  res.json(recipes);
});

router.get("/:id", async (req, res) => {
  const recipe = await db("recipes").where("id", req.params.id).first();
  const ingredients = await db("recipe_ingredients")
    .join("ingredients", "recipe_ingredients.ingredient_id", "ingredients.id")
    .select(
      "ingredients.name",
      "recipe_ingredients.quantity",
      "ingredients.unit",
      "ingredients.image_url"
    )
    .where("recipe_ingredients.recipe_id", req.params.id);

  res.json({ ...recipe, ingredients });
});

module.exports = router;

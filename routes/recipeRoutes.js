const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  try {
    const recipes = await db("recipes").select().orderBy("name", "asc");
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const recipe = await db("recipes").where({ id: req.params.id }).first();
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    const ingredients = await db("recipe_ingredients")
      .join("ingredients", "recipe_ingredients.ingredient_id", "ingredients.id")
      .select(
        "ingredients.id",
        "ingredients.name",
        "recipe_ingredients.quantity",
        "ingredients.unit",
        "ingredients.image_url"
      )
      .where("recipe_ingredients.recipe_id", req.params.id);

    res.json({ ...recipe, ingredients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

router.post("/", async (req, res) => {
  const { name, image_url, ingredients = [] } = req.body;
  try {
    const [recipe] = await db("recipes")
      .insert({ name, image_url })
      .returning("*");

    for (const item of ingredients) {
      await db("recipe_ingredients").insert({
        recipe_id: recipe.id,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
      });
    }

    res.status(201).json({ id: recipe.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

router.put("/:id/ingredients", async (req, res) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ error: "Ingredients must be an array" });
  }

  try {
    await db("recipe_ingredients").where({ recipe_id: req.params.id }).del();

    for (const item of ingredients) {
      await db("recipe_ingredients").insert({
        recipe_id: req.params.id,
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
      });
    }

    res.json({ success: true, message: "Ingredients updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update ingredients" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, image_url, ingredients } = req.body;

  if (!name || !Array.isArray(ingredients)) {
    return res
      .status(400)
      .json({ error: "Invalid input. Name and ingredients are required." });
  }

  try {
    const updateData = { name };
    if (image_url) {
      updateData.image_url = image_url;
    }

    await db("recipes").where({ id: req.params.id }).update(updateData);

    await db("recipe_ingredients").where({ recipe_id: req.params.id }).del();

    if (ingredients.length > 0) {
      for (const item of ingredients) {
        const exists = await db("recipe_ingredients")
          .where({
            recipe_id: req.params.id,
            ingredient_id: item.ingredient_id,
          })
          .first();

        if (!exists) {
          await db("recipe_ingredients").insert({
            recipe_id: req.params.id,
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
          });
        }
      }
    }

    res.json({ success: true, message: "Recipe and ingredients updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update recipe and ingredients" });
  }
});

module.exports = router;

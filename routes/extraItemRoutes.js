const express = require("express");
const router = express.Router();
const db = require("../db/connection");

// Get all extra items for a meal plan
router.get("/meal-plan/:mealPlanId", async (req, res) => {
  const { mealPlanId } = req.params;
  const extraItems = await db("extra_items")
    .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
    .where("extra_items.meal_plan_id", mealPlanId)
    .select(
      "extra_items.id",
      "extra_items.quantity",
      "ingredients.name",
      "ingredients.unit",
      "ingredients.image_url"
    );
  res.json(extraItems);
});

// Create a new extra item
router.post("/", async (req, res) => {
  const { meal_plan_id, ingredient_id, quantity } = req.body;
  try {
    const [id] = await db("extra_items").insert({ 
      meal_plan_id, 
      ingredient_id, 
      quantity 
    });
    const newItem = await db("extra_items")
      .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
      .where("extra_items.id", id)
      .select(
        "extra_items.id",
        "extra_items.quantity",
        "ingredients.name",
        "ingredients.unit",
        "ingredients.image_url"
      )
      .first();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to create extra item" });
  }
});

// Update an extra item
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { ingredient_id, quantity } = req.body;
  try {
    await db("extra_items")
      .where("id", id)
      .update({ ingredient_id, quantity });
    const updatedItem = await db("extra_items")
      .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
      .where("extra_items.id", id)
      .select(
        "extra_items.id",
        "extra_items.quantity",
        "ingredients.name",
        "ingredients.unit",
        "ingredients.image_url"
      )
      .first();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: "Failed to update extra item" });
  }
});

// Delete an extra item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db("extra_items").where("id", id).del();
  res.status(204).send();
});

module.exports = router;

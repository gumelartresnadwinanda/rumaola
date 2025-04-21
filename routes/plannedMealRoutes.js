const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.post("/", async (req, res) => {
  const { meal_plan_id, recipe_id, multiplier } = req.body;

  // Check if the recipe_id already exists in the meal_plan_id
  const existingEntry = await db("planned_meals")
    .where({ meal_plan_id, recipe_id })
    .first();

  if (existingEntry) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Recipe already exists in the meal plan.",
      });
  }

  // Insert the new planned meal if it doesn't exist
  await db("planned_meals").insert({ meal_plan_id, recipe_id, multiplier });
  res.status(201).json({ success: true });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.post("/", async (req, res) => {
  const { meal_plan_id, recipe_id, multiplier } = req.body;
  await db("planned_meals").insert({ meal_plan_id, recipe_id, multiplier });
  res.status(201).json({ success: true });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  const { is_extra = false } = req.query;
  const ingredients = await db("ingredients")
    .select([
      "id",
      "name",
      db.raw(is_extra ? '"unit_purchase" as "unit"' : '"unit"'),
      "image_url",
      "comparison_scale",
    ])
    .orderBy("name", "asc");
  res.json(ingredients);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const ingredient = await db("ingredients").where({ id }).first();
    if (!ingredient)
      return res.status(404).json({ error: "Ingredient not found" });
    res.json(ingredient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch ingredient" });
  }
});

router.post("/", async (req, res) => {
  const {
    name,
    unit,
    image_url,
    purchase_unit,
    comparison_scale,
    minimum_purchase,
  } = req.body;
  try {
    const [id] = await db("ingredients")
      .insert({
        name,
        unit,
        image_url,
        purchase_unit,
        comparison_scale,
        minimum_purchase,
      })
      .returning("id");
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ingredient" });
  }
});

router.put("/:id", async (req, res) => {
  const {
    name,
    unit,
    image_url,
    purchase_unit,
    comparison_scale,
    minimum_purchase,
  } = req.body;
  const { id } = req.params;
  try {
    await db("ingredients").where({ id }).update({
      name,
      unit,
      image_url,
      purchase_unit,
      comparison_scale,
      minimum_purchase,
    });
    res.json({ success: true, message: "Ingredient updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update ingredient" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  const ingredients = await db("ingredients").orderBy("name", "asc");
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
  const { name, unit, image_url } = req.body;
  try {
    const [id] = await db("ingredients")
      .insert({ name, unit, image_url })
      .returning("id");
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ingredient" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, unit, image_url } = req.body;
  const { id } = req.params;
  try {
    console.log("name", name);
    console.log("unit", unit);
    console.log("image_url", image_url);
    await db("ingredients").where({ id }).update({ name, unit, image_url });
    res.json({ success: true, message: "Ingredient updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update ingredient" });
  }
});

module.exports = router;

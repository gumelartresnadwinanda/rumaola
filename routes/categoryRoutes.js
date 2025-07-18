const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  try {
    const categories = await db("categories")
      .whereNull("deleted_at")
      .orderBy("name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const [category] = await db("categories")
      .insert({
        name,
        description,
        icon,
        color,
      })
      .returning("*");
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const [category] = await db("categories")
      .where({ id: req.params.id })
      .update({
        name,
        description,
        icon,
        color,
      })
      .returning("*");
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/delete", async (req, res) => {
  try {
    const updated = await db("categories")
      .where({ id: req.params.id })
      .update({ deleted_at: db.fn.now() });
    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
const express = require("express");
const router = express.Router();
const knex = require("../db/knex");

router.get("/", async (req, res) => {
  try {
    const categories = await knex("categories")
      .orderBy("name");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const [category] = await knex("categories")
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
    const [category] = await knex("categories")
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

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await knex("categories")
      .where({ id: req.params.id })
      .del();
    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
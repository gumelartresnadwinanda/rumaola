const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  try {
    const budgets = await db("budgets")
      .orderBy("start_date", "desc");
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { total_amount, start_date, end_date } = req.body;
    const [budget] = await db("budgets")
      .insert({
        total_amount,
        start_date,
        end_date,
      })
      .returning("*");
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { total_amount, start_date, end_date } = req.body;
    const [budget] = await db("budgets")
      .where({ id: req.params.id })
      .update({
        total_amount,
        start_date,
        end_date,
      })
      .returning("*");
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await db("budgets")
      .where({ id: req.params.id })
      .del();
    if (!deleted) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
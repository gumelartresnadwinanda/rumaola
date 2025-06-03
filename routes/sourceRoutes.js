const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  try {
    const sources = await db("sources")
      .orderBy("name");
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, type, balance } = req.body;
    const [source] = await db("sources")
      .insert({
        name,
        description,
        type,
        balance: balance || 0,
      })
      .returning("*");
    res.status(201).json(source);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, description, type, balance } = req.body;
    const [source] = await db("sources")
      .where({ id: req.params.id })
      .update({
        name,
        description,
        type,
        balance,
      })
      .returning("*");
    if (!source) {
      return res.status(404).json({ error: "Source not found" });
    }
    res.json(source);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await db("sources")
      .where({ id: req.params.id })
      .del();
    if (!deleted) {
      return res.status(404).json({ error: "Source not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/balance-history", async (req, res) => {
  try {
    const expenses = await db("expenses")
      .where({ source_id: req.params.id })
      .orderBy("date", "desc");
    
    const source = await db("sources")
      .where({ id: req.params.id })
      .first();
    
    if (!source) {
      return res.status(404).json({ error: "Source not found" });
    }

    res.json({
      current_balance: source.balance,
      expenses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
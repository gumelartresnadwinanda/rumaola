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

router.post("/transfer", async (req, res) => {
  try {
    const { fromSourceId, toSourceId, amount } = req.body;

    if (!fromSourceId || !toSourceId || !amount) {
      return res.status(400).json({ error: "Missing required fields: fromSourceId, toSourceId, and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Transfer amount must be greater than 0" });
    }

    if (fromSourceId === toSourceId) {
      return res.status(400).json({ error: "Cannot transfer to the same source" });
    }

    const result = await db.transaction(async (trx) => {
      // Get and lock both sources
      const [fromSource, toSource] = await Promise.all([
        trx("sources").where({ id: fromSourceId }).first().forUpdate(),
        trx("sources").where({ id: toSourceId }).first().forUpdate()
      ]);

      if (!fromSource || !toSource) {
        throw new Error("One or both sources not found");
      }

      if (fromSource.balance < amount) {
        throw new Error("Insufficient balance in source account");
      }

      // Update balances
      const [updatedFromSource, updatedToSource] = await Promise.all([
        trx("sources")
          .where({ id: fromSourceId })
          .update({ balance: fromSource.balance - amount })
          .returning("*"),
        trx("sources")
          .where({ id: toSourceId })
          .update({ balance: toSource.balance + amount })
          .returning("*")
      ]);

      return {
        fromSource: updatedFromSource[0],
        toSource: updatedToSource[0]
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
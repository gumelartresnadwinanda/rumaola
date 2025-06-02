const express = require("express");
const router = express.Router();
const knex = require("../db/knex");

router.get("/", async (req, res) => {
  try {
    const { start_date, end_date, category_id, source_id } = req.query;
    let query = knex("expenses")
      .orderBy("date", "desc");

    if (start_date) {
      query = query.where("date", ">=", start_date);
    }
    if (end_date) {
      query = query.where("date", "<=", end_date);
    }
    if (category_id) {
      query = query.where("category_id", category_id);
    }
    if (source_id) {
      query = query.where("source_id", source_id);
    }

    const expenses = await query;
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const trx = await knex.transaction();
  try {
    const { amount, date, description, category_id, source_id } = req.body;
    
    const [expense] = await trx("expenses")
      .insert({
        amount,
        date,
        description,
        category_id,
        source_id,
      })
      .returning("*");

    await trx("sources")
      .where({ id: source_id })
      .decrement("balance", amount);

    await trx.commit();
    res.status(201).json(expense);
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const trx = await knex.transaction();
  try {
    const { amount, date, description, category_id, source_id } = req.body;
    
    const oldExpense = await trx("expenses")
      .where({ id: req.params.id })
      .first();

    if (!oldExpense) {
      await trx.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }

    const [expense] = await trx("expenses")
      .where({ id: req.params.id })
      .update({
        amount,
        date,
        description,
        category_id,
        source_id,
      })
      .returning("*");

    await trx("sources")
      .where({ id: oldExpense.source_id })
      .increment("balance", oldExpense.amount);

    await trx("sources")
      .where({ id: source_id })
      .decrement("balance", amount);

    await trx.commit();
    res.json(expense);
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const trx = await knex.transaction();
  try {
    const expense = await trx("expenses")
      .where({ id: req.params.id })
      .first();

    if (!expense) {
      await trx.rollback();
      return res.status(404).json({ error: "Expense not found" });
    }

    await trx("sources")
      .where({ id: expense.source_id })
      .increment("balance", expense.amount);

    await trx("expenses")
      .where({ id: req.params.id })
      .del();

    await trx.commit();
    res.status(204).send();
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
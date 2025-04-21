const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.post("/", async (req, res) => {
  const { meal_plan_id, name, quantity, unit } = req.body;
  await db("extra_items").insert({ meal_plan_id, name, quantity, unit });
  res.status(201).json({ success: true });
});

module.exports = router;

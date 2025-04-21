const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  const ingredients = await db("ingredients");
  res.json(ingredients);
});

module.exports = router;

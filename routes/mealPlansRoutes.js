const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  const plans = await db("meal_plans");
  res.json(plans);
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  const [id] = await db("meal_plans").insert({ title }).returning("id");
  res.status(201).json({ id });
});

router.get("/latest-id", async (req, res) => {
  const latestMealPlan = await db("meal_plans")
    .where("archived", false)
    .orderBy("created_at", "desc")
    .first();
  res.json({ id: latestMealPlan.id });
});

router.get("/:id/grocery-list", async (req, res) => {
  const mealPlanId = req.params.id;
  // 1. Fetch all planned meals and their ingredients
  const plannedIngredients = await db("planned_meals")
    .join(
      "recipe_ingredients",
      "planned_meals.recipe_id",
      "recipe_ingredients.recipe_id"
    )
    .join("ingredients", "recipe_ingredients.ingredient_id", "ingredients.id")
    .select(
      "ingredients.name",
      "ingredients.unit",
      "ingredients.image_url",
      db.raw(
        "recipe_ingredients.quantity * planned_meals.multiplier as quantity"
      )
    )
    .where("planned_meals.meal_plan_id", mealPlanId);

  // 2. Fetch extra grocery items
  const extraItems = await db("extra_items")
    .select("name", "unit", "quantity")
    .where("meal_plan_id", mealPlanId);

  // 3. Combine and group by name+unit
  const grouped = {};

  [...plannedIngredients, ...extraItems].forEach((item) => {
    const key = `${item.name}-${item.unit}`;
    if (!grouped[key]) {
      grouped[key] = {
        name: item.name,
        total_quantity: parseFloat(item.quantity),
        unit: item.unit,
        image_url: item.image_url || null,
      };
    } else {
      grouped[key].total_quantity += parseFloat(item.quantity);
    }
  });

  const groceryList = Object.values(grouped);
  res.json(groceryList);
});

router.get("/:id/grocery-list/by-recipe", async (req, res) => {
  const mealPlanId = req.params.id;

  // Get planned meals with their multiplier and recipe name
  const plannedMeals = await db("planned_meals")
    .join("recipes", "planned_meals.recipe_id", "recipes.id")
    .select(
      "planned_meals.recipe_id",
      "planned_meals.multiplier",
      "recipes.name as recipe_name",
      "recipes.image_url"
    )
    .where("planned_meals.meal_plan_id", mealPlanId);

  const result = [];

  for (const meal of plannedMeals) {
    const ingredients = await db("recipe_ingredients")
      .join("ingredients", "recipe_ingredients.ingredient_id", "ingredients.id")
      .select(
        "ingredients.name",
        db.raw("recipe_ingredients.quantity * ? as quantity", [
          meal.multiplier,
        ]),
        "ingredients.unit",
        "ingredients.image_url"
      )
      .where("recipe_ingredients.recipe_id", meal.recipe_id);

    result.push({
      recipe_name: meal.recipe_name,
      image_url: meal.image_url,
      ingredients,
    });
  }

  // Add extras as a "manual" recipe
  const extras = await db("extra_items").where("meal_plan_id", mealPlanId);
  if (extras.length > 0) {
    result.push({
      recipe_name: "Tambahan Manual",
      image_url: null,
      ingredients: extras.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        image_url: null,
      })),
    });
  }

  res.json(result);
});

router.get("/:id", async (req, res) => {
  const plan = await db("meal_plans").where("id", req.params.id).first();

  const meals = await db("planned_meals")
    .join("recipes", "planned_meals.recipe_id", "recipes.id")
    .select("recipes.name", "recipes.image_url", "planned_meals.multiplier")
    .where("planned_meals.meal_plan_id", req.params.id);

  const extras = await db("extra_items").where("meal_plan_id", req.params.id);

  res.json({ ...plan, meals, extras });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/", async (req, res) => {
  const plans = await db("meal_plans")
    .where("archived", false)
    .orderBy("created_at", "desc");
  res.json(plans);
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  const [id] = await db("meal_plans").insert({ title }).returning("id");
  res.status(201).json({ id });
});

router.post("/complete", async (req, res) => {
  const { title, meals, extra_items } = req.body;
  if (!title || !Array.isArray(meals) || !Array.isArray(extra_items)) {
    return res.status(400).json("Invalid input");
  }

  try {
    const [mealPlanId] = await db("meal_plans")
      .insert({ title })
      .returning("id");

    for (const recipe of meals) {
      await db("planned_meals").insert({
        meal_plan_id: mealPlanId.id,
        recipe_id: recipe,
      });
    }

    for (const ingredient of extra_items) {
      await db("extra_items").insert({
        meal_plan_id: mealPlanId.id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
      });
    }

    res.status(201).json({
      success: true,
      message: "Meal Plan Created",
      meal_plan_id: mealPlanId.id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Failed to create meal plan. error: ${e}` });
  }
});

router.put("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const { title, meals, extra_items } = req.body;
  if (!title || !Array.isArray(meals) || !Array.isArray(extra_items)) {
    return res.status(400).json("Invalid input");
  }

  try {
    await db("meal_plans").where("id", id).update({ title });
    await db("planned_meals").where("meal_plan_id", id).del();
    for (const meal of meals) {
      await db("planned_meals").insert({ meal_plan_id: id, recipe_id: meal });
    }
    await db("extra_items").where("meal_plan_id", id).del();
    for (const ingredient of extra_items) {
      await db("extra_items").insert({
        meal_plan_id: id,
        ingredient_id: ingredient.ingredient_id,
        quantity: ingredient.quantity,
      });
    }

    res.json({ success: true, message: "Meal Plan Updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: `Failed to update meal plan. error: ${e}` });
  }
});

router.put("/:id/archive", async (req, res) => {
  const { id } = req.params;

  try {
    await db("meal_plans").where("id", id).update({ archived: true });

    res.json({ success: true, message: "Meal plan archived" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to archive meal plan" });
  }
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

  // 2. Fetch extra grocery items with ingredient details
  const extraItems = await db("extra_items")
    .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
    .select(
      "ingredients.id",
      "ingredients.name",
      "ingredients.unit",
      "ingredients.image_url",
      "extra_items.quantity"
    )
    .where("extra_items.meal_plan_id", mealPlanId);

  // 3. Combine and group by name+unit
  const grouped = {};

  [...plannedIngredients, ...extraItems].forEach((item) => {
    const key = `${item.name}-${item.unit}`;
    if (!grouped[key]) {
      grouped[key] = {
        id: item.id,
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
        "ingredients.id",
        "ingredients.unit",
        "ingredients.image_url"
      )
      .where("recipe_ingredients.recipe_id", meal.recipe_id);

    result.push({
      id: meal.recipe_id,
      name: meal.recipe_name,
      image_url: meal.image_url,
      ingredients,
    });
  }

  // Get extra items with ingredient details
  const extras = await db("extra_items")
    .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
    .select(
      "ingredients.id",
      "ingredients.name",
      "ingredients.unit",
      "ingredients.image_url",
      "extra_items.quantity"
    )
    .where("extra_items.meal_plan_id", mealPlanId);

  if (extras.length > 0) {
    result.push({
      id: 9999999999999999,
      name: "Tambahan Manual",
      image_url: null,
      ingredients: extras.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        image_url: item.image_url,
      })),
    });
  }

  res.json(result);
});

router.get("/:id", async (req, res) => {
  const plan = await db("meal_plans").where("id", req.params.id).first();

  const meals = await db("planned_meals")
    .join("recipes", "planned_meals.recipe_id", "recipes.id")
    .select(
      "recipes.id",
      "recipes.name",
      "recipes.image_url",
      "planned_meals.multiplier"
    )
    .where("planned_meals.meal_plan_id", req.params.id);

  // Get extra items with ingredient details
  const extras = await db("extra_items")
    .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
    .select(
      "extra_items.ingredient_id as id",
      "extra_items.quantity",
      "ingredients.name",
      "ingredients.unit",
      "ingredients.image_url"
    )
    .where("extra_items.meal_plan_id", req.params.id);

  res.json({ ...plan, meals, extras });
});

module.exports = router;

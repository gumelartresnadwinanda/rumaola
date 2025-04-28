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
        quantity: ingredient.quantity * (ingredient.comparison_scale || 1),
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
        quantity: ingredient.quantity * (ingredient.comparison_scale || 1),
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
        db.raw(
          "ROUND((recipe_ingredients.quantity * ? * (1 / ingredients.comparison_scale))::numeric, 2) as quantity",
          [meal.multiplier]
        ),
        "ingredients.id",
        "ingredients.unit_purchase as unit",
        "ingredients.image_url",
        "ingredients.minimum_purchase"
      )
      .where("recipe_ingredients.recipe_id", meal.recipe_id);

    const formattedIngredients = ingredients.map((item) => {
      let quantityNum = Number(item.quantity);
      quantityNum = Math.round(quantityNum * 100) / 100;
      return {
        ...item,
        quantity: quantityNum % 1 === 0 ? parseInt(quantityNum) : quantityNum,
      };
    });

    result.push({
      id: meal.recipe_id,
      name: meal.recipe_name,
      image_url: meal.image_url,
      ingredients: formattedIngredients,
    });
  }

  // Get extra items with ingredient details
  const extras = await db("extra_items")
    .join("ingredients", "extra_items.ingredient_id", "ingredients.id")
    .select(
      "ingredients.id",
      "ingredients.name",
      "ingredients.unit_purchase as unit",
      "ingredients.image_url",
      "ingredients.minimum_purchase",
      db.raw(
        "ROUND((extra_items.quantity * (1 / ingredients.comparison_scale))::numeric, 2) as quantity"
      )
    )
    .where("extra_items.meal_plan_id", mealPlanId);

  if (extras.length > 0) {
    result.push({
      id: 9999999999999999,
      name: "Tambahan Manual",
      image_url: null,
      ingredients: extras.map((item) => {
        let quantityNum = Number(item.quantity);
        quantityNum = Math.round(quantityNum * 100) / 100;
        return {
          id: item.id,
          name: item.name,
          quantity: quantityNum % 1 === 0 ? parseInt(quantityNum) : quantityNum,
          unit: item.unit,
          image_url: item.image_url,
        };
      }),
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
      db.raw(
        "ROUND((extra_items.quantity * (1 / ingredients.comparison_scale))::numeric, 2) as quantity"
      ),
      "ingredients.name",
      "ingredients.unit_purchase as unit",
      "ingredients.image_url",
      "ingredients.comparison_scale"
    )
    .where("extra_items.meal_plan_id", req.params.id);

  const formattedExtras = extras.map((item) => {
    let quantityNum = Number(item.quantity);
    quantityNum = Math.round(quantityNum * 100) / 100;
    return {
      ...item,
      quantity: quantityNum % 1 === 0 ? parseInt(quantityNum) : quantityNum,
    };
  });
  res.json({ ...plan, meals, extras: formattedExtras });
});

module.exports = router;

exports.seed = async function (knex) {
  await knex("extra_items").del();

  // First, get the ingredient IDs for the items we want to use
  const ingredients = await knex("ingredients").select("id", "name");

  // Find the ingredient IDs we need
  const gulaId = ingredients.find((i) => i.name === "Gula Pasir")?.id;
  const tehId = ingredients.find((i) => i.name === "Teh Celup")?.id;

  // If the ingredients don't exist, create them first
  if (!gulaId) {
    const [newGulaId] = await knex("ingredients")
      .insert({
        name: "Gula Pasir",
        unit: "gram",
        image_url: "https://example.com/gula.jpg",
      })
      .returning("*");
  }

  if (!tehId) {
    const [newTehId] = await knex("ingredients")
      .insert({
        name: "Teh Celup",
        unit: "kotak",
        image_url: "https://example.com/teh.jpg",
      })
      .returning("*");
  }

  // Get the final ingredient IDs
  const finalIngredients = await knex("ingredients").select("id", "name");
  const finalGulaId = finalIngredients.find((i) => i.name === "Gula Pasir")?.id;
  const finalTehId = finalIngredients.find((i) => i.name === "Teh Celup")?.id;

  await knex("extra_items").insert([
    { meal_plan_id: 1, ingredient_id: finalTehId, quantity: 1 },
    { meal_plan_id: 1, ingredient_id: finalGulaId, quantity: 500 },
  ]);
};

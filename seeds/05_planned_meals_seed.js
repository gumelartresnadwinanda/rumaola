exports.seed = async function (knex) {
  await knex("planned_meals").del();

  await knex("planned_meals").insert([
    { meal_plan_id: 1, recipe_id: 1, multiplier: 2 }, // Nasi Goreng Sederhana (2 porsi)
    { meal_plan_id: 1, recipe_id: 2, multiplier: 1 }, // Mie Goreng Sosis
  ]);
};

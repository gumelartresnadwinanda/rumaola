exports.seed = async function (knex) {
  await knex("extra_items").del();

  await knex("extra_items").insert([
    { meal_plan_id: 1, name: "Teh Celup", quantity: 1, unit: "kotak" },
    { meal_plan_id: 1, name: "Gula Pasir", quantity: 500, unit: "gram" },
  ]);
};

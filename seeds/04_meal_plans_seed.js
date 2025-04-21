exports.seed = async function (knex) {
  await knex("meal_plans").del();

  await knex("meal_plans").insert([
    {
      id: 1,
      title: "Menu Minggu Ini",
      created_at: knex.fn.now(),
      archived: false,
    },
  ]);
};

exports.seed = async function (knex) {
  await knex("recipe_ingredients").del();

  await knex("recipe_ingredients").insert([
    // Nasi Goreng Sederhana
    { recipe_id: 1, ingredient_id: 1, quantity: 1 }, // Kecap Manis
    { recipe_id: 1, ingredient_id: 2, quantity: 1 }, // Telur
    { recipe_id: 1, ingredient_id: 3, quantity: 1 }, // Nasi Putih
    { recipe_id: 1, ingredient_id: 4, quantity: 2 }, // Bawang Merah
    { recipe_id: 1, ingredient_id: 5, quantity: 1 }, // Minyak Goreng

    // Mie Goreng Sosis
    { recipe_id: 2, ingredient_id: 6, quantity: 1 }, // Mie Instan
    { recipe_id: 2, ingredient_id: 8, quantity: 1 }, // Sosis
    { recipe_id: 2, ingredient_id: 4, quantity: 1 }, // Bawang Merah
    { recipe_id: 2, ingredient_id: 7, quantity: 1 }, // Cabe Merah
  ]);
};

exports.up = function (knex) {
  return knex.schema.createTable("recipe_ingredients", (table) => {
    table
      .integer("recipe_id")
      .unsigned()
      .references("id")
      .inTable("recipes")
      .onDelete("CASCADE");
    table
      .integer("ingredient_id")
      .unsigned()
      .references("id")
      .inTable("ingredients")
      .onDelete("CASCADE");
    table.float("quantity").notNullable();
    table.string("unit");
    table.primary(["recipe_id", "ingredient_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("recipe_ingredients");
};

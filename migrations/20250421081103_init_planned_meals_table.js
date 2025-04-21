exports.up = function (knex) {
  return knex.schema.createTable("planned_meals", (table) => {
    table.increments("id").primary();
    table
      .integer("meal_plan_id")
      .unsigned()
      .references("id")
      .inTable("meal_plans")
      .onDelete("CASCADE");
    table
      .integer("recipe_id")
      .unsigned()
      .references("id")
      .inTable("recipes")
      .onDelete("CASCADE");
    table.integer("multiplier").defaultTo(1);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("planned_meals");
};

exports.up = function (knex) {
  return knex.schema.createTable("extra_items", (table) => {
    table.increments("id").primary();
    table
      .integer("meal_plan_id")
      .unsigned()
      .references("id")
      .inTable("meal_plans")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.float("quantity").notNullable();
    table.string("unit");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("extra_items");
};

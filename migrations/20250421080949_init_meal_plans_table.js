exports.up = function (knex) {
  return knex.schema.createTable("meal_plans", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("archived").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("meal_plans");
};

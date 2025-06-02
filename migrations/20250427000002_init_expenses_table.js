exports.up = function (knex) {
  return knex.schema.createTable("expenses", (table) => {
    table.increments("id").primary();
    table.decimal("amount", 10, 2).notNullable();
    table.date("date").notNullable();
    table.string("description");
    table.integer("category_id").unsigned().notNullable();
    table.timestamps(true, true);
    table.foreign("category_id").references("categories.id").onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("expenses");
}; 
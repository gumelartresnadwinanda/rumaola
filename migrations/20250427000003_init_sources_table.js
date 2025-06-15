exports.up = function (knex) {
  return knex.schema.createTable("sources", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("description");
    table.string("type").notNullable(); // e.g., "income", "savings", "credit", "other"
    table.decimal("balance", 10, 2).defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("sources");
}; 
exports.up = function (knex) {
  return knex.schema.createTable("budgets", (table) => {
    table.increments("id").primary();
    table.decimal("total_amount", 10, 2).notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("budgets");
}; 
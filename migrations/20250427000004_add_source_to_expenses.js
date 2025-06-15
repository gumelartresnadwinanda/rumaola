exports.up = function (knex) {
  return knex.schema.alterTable("expenses", (table) => {
    table.integer("source_id").unsigned().notNullable();
    table.foreign("source_id").references("sources.id").onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("expenses", (table) => {
    table.dropForeign("source_id");
    table.dropColumn("source_id");
  });
}; 
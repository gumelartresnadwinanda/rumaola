exports.up = function (knex) {
  return knex.schema.alterTable("extra_items", (table) => {
    table.dropColumn("name");
    table.dropColumn("unit");
    table
      .integer("ingredient_id")
      .unsigned()
      .references("id")
      .inTable("ingredients")
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("extra_items", (table) => {
    table.string("name").notNullable();
    table.string("unit");
    table.dropColumn("ingredient_id");
  });
}; 
exports.up = function (knex) {
  return knex.schema.createTable("ingredients", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("unit");
    table.string("image_url");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ingredients");
};

exports.up = function (knex) {
  return knex.schema.createTable("recipes", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("default_portion").defaultTo(1);
    table.string("image_url");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("recipes");
};

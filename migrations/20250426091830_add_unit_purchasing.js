exports.up = async function (knex) {
  await knex.schema.table("ingredients", function (table) {
    table.string("unit_purchase");
    table.float("minimum_purchase").defaultTo(1);
    table.float("comparison_scale").defaultTo(1);
  });
};

exports.down = async function (knex) {
  await knex.schema.table("ingredients", function (table) {
    table.dropColumn("unit_purchase");
    table.dropColumn("comparison_scale");
    table.dropColumn("minimum_purchase");
  });
};

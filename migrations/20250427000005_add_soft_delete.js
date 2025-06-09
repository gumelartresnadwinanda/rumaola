exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('budgets', table => {
      table.timestamp('deleted_at').nullable();
    }),
    knex.schema.alterTable('categories', table => {
      table.timestamp('deleted_at').nullable();
    }),
    knex.schema.alterTable('expenses', table => {
      table.timestamp('deleted_at').nullable();
    }),
    knex.schema.alterTable('sources', table => {
      table.timestamp('deleted_at').nullable();
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('budgets', table => {
      table.dropColumn('deleted_at');
    }),
    knex.schema.alterTable('categories', table => {
      table.dropColumn('deleted_at');
    }),
    knex.schema.alterTable('expenses', table => {
      table.dropColumn('deleted_at');
    }),
    knex.schema.alterTable('sources', table => {
      table.dropColumn('deleted_at');
    })
  ]);
}; 
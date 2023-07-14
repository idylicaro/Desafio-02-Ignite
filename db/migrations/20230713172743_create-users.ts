import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable().index();
    table.integer('count_meals').defaultTo(0);
    table.integer('count_meals_in_diet').defaultTo(0);
    table.string('session_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}

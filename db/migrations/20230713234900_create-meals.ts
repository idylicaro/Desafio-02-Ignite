import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').references('id').inTable('users');
    table.string('name').notNullable();
    table.string('description');
    table.dateTime('created_at');
    table.dateTime('updated_at');
    table.boolean('in_diet').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}

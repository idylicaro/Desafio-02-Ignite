import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import * as z from 'zod';
import { randomUUID } from 'crypto';
import { User } from '../models/users';

export async function mealsRoutes(app: FastifyInstance) {
  //zod to validate the body
  const bodySchema = z
    .object({
      name: z.string().min(3).max(255),
      description: z.string().max(255),
      in_diet: z.boolean()
    })
    .required();

  app.post('/', {}, async (request, reply) => {
    // TODO: add pre handler to validate the session id cookie
    const { body } = request;

    const validatedBody = bodySchema.parse(body);

    let { session_id } = request.cookies;

    const [user] = await knex('users').select('id').where({ session_id });

    const currentTime = new Date();
    const meal = await knex('meals').insert({
      id: randomUUID(),
      user_id: user.id,
      created_at: currentTime,
      updated_at: currentTime,
      ...validatedBody
    });

    return reply.status(201).send();
  });
}

import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import * as z from 'zod';
import { randomUUID } from 'crypto';

export async function usersRoutes(app: FastifyInstance) {
  //zod to validate the body
  const bodySchema = z
    .object({
      username: z.string().min(3).max(255),
      email: z.string().email()
    })
    .required();
  app.post('/', {}, async (request, reply) => {
    const { body } = request;

    const validatedBody = bodySchema.parse(body);

    let session_id = request.cookies.session_id;
    if (!session_id) {
      session_id = randomUUID();

      reply.cookie('session_id', session_id, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });
    }

    const user = await knex('users').insert({
      id: randomUUID(),
      ...validatedBody,
      session_id
    });

    return reply.status(201).send();
  });
}

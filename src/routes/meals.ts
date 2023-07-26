import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import * as z from 'zod';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function mealsRoutes(app: FastifyInstance) {
  //zod to validate the body
  const bodySchema = z
    .object({
      name: z.string().min(3).max(255),
      description: z.string().max(255),
      in_diet: z.boolean()
    })
    .required();

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
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
    }
  );

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      let { session_id } = request.cookies;

      const [user] = await knex('users').select('id').where({ session_id });

      const meals = await knex('meals').select().where({ user_id: user.id });

      return reply.status(200).send(meals);
    }
  );

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid()
      });

      let { session_id } = request.cookies;

      const [user] = await knex('users').select('id').where({ session_id });
      const params = getMealParamsSchema.parse(request.params);

      const meal = await knex('meals')
        .select()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .first();

      if (!meal) {
        return reply.status(404).send();
      }

      return reply.status(200).send(meal);
    }
  );

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid()
      });

      const bodySchema = z
        .object({
          name: z.string().min(3).max(255),
          description: z.string().max(255),
          in_diet: z.boolean()
        })
        .partial();

      let { session_id } = request.cookies;

      const [user] = await knex('users').select('id').where({ session_id });
      const params = getMealParamsSchema.parse(request.params);
      const body = bodySchema.parse(request.body);

      const meal = await knex('meals')
        .select()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .first();

      if (!meal) {
        return reply.status(404).send();
      }

      const currentTime = new Date();
      await knex('meals')
        .update({
          ...body,
          ...meal,
          updated_at: currentTime
        })
        .where('id', params.id);

      return reply.status(204).send();
    }
  );

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid()
      });

      let { session_id } = request.cookies;

      const [user] = await knex('users').select('id').where({ session_id });
      const params = getMealParamsSchema.parse(request.params);

      const meal = await knex('meals')
        .select()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .first();

      if (!meal) {
        return reply.status(404).send();
      }

      await knex('meals').delete().where('id', params.id);

      return reply.status(204).send();
    }
  );

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      // Quantidade total de refeições registradas
      // Quantidade total de refeições registradas na dieta
      // Quantidade total de refeições registradas fora da dieta
      // Melhor sequência de refeições dentro da dieta

      let { session_id } = request.cookies;

      const [user] = await knex('users').select('id').where({ session_id });

      const meals = await knex('meals').select().where({ user_id: user.id });

      const totalMeals = meals.length;
      const totalMealsInDiet = meals.filter((meal) => meal.in_diet).length;
      const totalMealsNotInDiet = meals.filter((meal) => !meal.in_diet).length;

      meals.sort((a, b) => {
        return a.created_at > b.created_at ? 1 : -1;
      });

      // best sequence of meals in diet (when create a meal not in diet the sequence is broken)
      let bestSequence = 0;
      let currentSequence = 0;
      for (let i = 0; i < meals.length; i++) {
        if (meals[i].in_diet) {
          currentSequence++;
        } else {
          currentSequence = 0;
        }
        if (currentSequence > bestSequence) {
          bestSequence = currentSequence;
        }
      }

      return reply.status(200).send({
        totalMeals,
        totalMealsInDiet,
        totalMealsNotInDiet,
        bestSequence
      });
    }
  );
}

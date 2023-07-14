// eslint-disable-next-line
import { UUID } from 'crypto';
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    // tables here {key: type}
    users: {
      id: UUID;
      username: string;
      email: string;
      count_meals: number;
      count_meals_in_diet: number;
      session_id?: string;
    };
    meals: {
      id: UUID;
      user_id: UUID;
      name: string;
      description: string;
      created_at: Date;
      updated_at: Date;
      in_diet: boolean;
    };
  }
}

import { UUID } from 'crypto';

export interface User {
  id: UUID;
  username?: string;
  email?: string;
  count_meals?: number;
  count_meals_in_diet?: number;
  session_id?: string;
}

import { UUID } from 'crypto';

export interface Meal {
  id: UUID;
  user_id: UUID;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  in_diet: boolean;
}

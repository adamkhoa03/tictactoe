export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  gamesPlayed?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

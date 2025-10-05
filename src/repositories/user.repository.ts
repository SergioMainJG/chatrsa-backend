import { type User } from "../models/user.ts";
import { Result } from "../utils/patterns/result.pattern.ts";

export abstract class UserRepository {
  abstract getUserById(user: { id: number }): Promise<Result<User, Error>>;
  abstract createUser(userProps: { name: string, password: string }): Promise<Result<User, Error>>;
  abstract deleteUser(user: { ide: number }): Promise<Result<boolean, Error>>;
}
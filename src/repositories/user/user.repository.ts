import { type User } from "../../models/user.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export abstract class UserRepository {
  abstract getUserByName(user: { name: string }): Promise<Result<User, Error>>;
  abstract getUserById(user: { id: number }): Promise<Result<User, Error>>;
  abstract createUser(user: { name: string, password: string }): Promise<Result<User, Error>>;
  abstract deleteUser(user: { id: number }): Promise<Result<boolean, Error>>;
}
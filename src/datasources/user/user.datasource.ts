import { type User } from "../../models/user.ts";
import { type Result } from "../../utils/patterns/result.pattern.ts";

export abstract class UserDatasource {
  abstract getUserById(id: number): Promise<Result<User, Error>>;
  abstract createUser(name: string, password: string): Promise<Result<User, Error>>;
  abstract deleteUser(id: number): Promise<Result<boolean, Error>>;
}
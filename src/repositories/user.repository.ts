import { type User } from "../models/user.ts";
import { Result } from "../utils/patterns/result.pattern.ts";

export abstract class UserRepository{
  abstract getUserById( id: number ): Promise<Result<User>>;
  abstract createUser( userProps: {name:string, password:string} ): Promise<Result<User>>;
  abstract deleteUser( id: number ): Promise<Result<boolean>>;
}
import { UserRepository } from "./user.repository.ts";
import { UserDatasource } from "../../datasources/user/user.datasource.ts";
import { User } from "../../models/user.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly datasource: UserDatasource
  ) { }
  getUserById(user: { id: number; }): Promise<Result<User, Error>> {
    return this.datasource.getUserById(user.id);
  }
  getUserByName(user: { name: string; }): Promise<Result<User, Error>> {
    return this.datasource.getUserByName(user.name);
  }
  createUser(user: { name: string; password: string; }): Promise<Result<User, Error>> {
    return this.datasource.createUser(user.name, user.password);
  }
  deleteUser(user: { id: number; }): Promise<Result<boolean, Error>> {
    return this.datasource.deleteUser(user.id);
  }
}

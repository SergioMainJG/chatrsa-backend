import { kvInstance } from "../../config/deno-kv/database.kv.config.ts";
import { User } from "../../models/user.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { UserDatasource } from "./user.datasource.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";

const isUser = (obj: any): obj is User => {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.password === "string"
  );
};

const kv = await kvInstance;

export class UserDatasourceKV implements UserDatasource {
  
  async getUserById(id: number): Promise<Result<User, Error>> {
    try {
      const result = await kv.get<User>(["users", id]);
      if (!result.value) {
        throw CustomError.notFound(`User with id: "${id}" not found`);
      }
      return Result.Success(result.value);
    } catch (error) {
      return Result.Failure(error as Error);
    }
  }

  async getUserByName(name: string): Promise<Result<User, Error>> {
    try {
      const result = await kv.get<User>(["users_by_name", name]);
      if (!result.value) {
        throw new Error(`User with name: "${name}" not found`, { cause: "Not found it" });
      }
      return Result.Success(result.value);
    } catch (error) {
      return Result.Failure(error as Error);
    }
  }

  async createUser(name: string, password: string): Promise<Result<User, Error>> {
    try {
      await kv.atomic().mutate({
        type: "sum",
        key: ["users_counter"],
        value: new Deno.KvU64(1n),
      }).commit();
      
      const counterResult = await kv.get<Deno.KvU64>(["users_counter"]);
      const newId = Number(counterResult.value?.value ?? 1n);

      const userResult = User.create({ id: newId, name, password });
      if (!userResult.isSuccess) return userResult;
      const user = userResult.value!;

      const commitResult = await kv.atomic()
        .check({ key: ["users_by_name", name], versionstamp: null })
        .set(["users", user.id], user)
        .set(["users_by_name", user.name], user)
        .commit();
      
      if (!commitResult.ok) {
        throw CustomError.badRequest(`User with name: "${name}" is already in use`);
      }

      return Result.Success(user);
    } catch (error) {
      return Result.Failure(error as Error);
    }
  }
  
  async deleteUser(id: number): Promise<Result<boolean, Error>> {
    try {
      const userResult = await this.getUserById(id);
      if (!userResult.isSuccess) return Result.Failure(userResult.error as Error);
      const user = userResult.value!;

      const commitResult = await kv.atomic()
        .delete(["users", user.id])
        .delete(["users_by_name", user.name])
        .commit();

      if (!commitResult.ok) throw new Error(`Failed to delete user with id: ${id}`);
      return Result.Success(true);
    } catch (error) {
      return Result.Failure(error as Error);
    }
  }
}
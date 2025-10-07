import { StatementSync } from "node:sqlite";
import GLOBAL_CONFIG from "../../config/env/get.env.ts";
import { dbInstance } from "../../config/sqlite/database.sqlite.config.ts";
import { UserDatasource } from "./user.datasource.ts";
import { User } from "../../models/user.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

const isUser = (obj: any): obj is User => {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.password === "string"
  )
}

export class UserDatasourceSQLite implements UserDatasource {

  private readonly findByNameStatement: StatementSync;
  private readonly findByIdStatement: StatementSync;
  private readonly createStmt: StatementSync;
  private readonly deleteStatement: StatementSync;

  constructor() {
    this.findByNameStatement = dbInstance.prepare(`SELECT * FROM ${GLOBAL_CONFIG.database.tableUser} WHERE name = :name`);
    this.findByIdStatement = dbInstance.prepare(`SELECT * FROM ${GLOBAL_CONFIG.database.tableUser} WHERE id = :id`);
    this.createStmt = dbInstance.prepare(`INSERT INTO ${GLOBAL_CONFIG.database.tableUser} (name, password) VALUES (:name, :password) RETURNING *`);
    this.deleteStatement = dbInstance.prepare(`DELETE FROM ${GLOBAL_CONFIG.database.tableUser} WHERE id = :id`);
  }
  getUserById(id: number): Promise<Result<User, Error>> {
    return Result.try(
      () => {
        const user = this.findByIdStatement.get({ ':id': id });
        if (!isUser(user)) throw new Error(`User with id: "${id}" not found`, {cause:"Not found it"});
        return user;
      }
    );
  }

  getUserByName(name: string): Promise<Result<User, Error>> {
    return Result.try(
      () => {
        const user = this.findByNameStatement.get({ ':name': name });
        if (!isUser(user)) throw new Error(`User with name: "${name}" not found`, {cause: "Not found it"});
        return user;
      }
    );
  }
  createUser(name: string, password: string): Promise<Result<User, Error>> {
    return Result.try(
      () => {
        const user = this.createStmt.get({
          ':name': name,
          ':password': password,
        });
        if (!isUser(user)) throw new Error(`The user with name: ${name} is already in use`, {cause: "Already exists"});
        return user;
      }
    );
  }
  deleteUser(id: number): Promise<Result<boolean, Error>> {
    return Result.try(
      () => {
        const result = this.deleteStatement.run({ ":id": id });
        if (result.changes === 0) throw new Error(`User with id: "${id}" not found`, {cause: "Not found it"});
        return true;
      }
    );
  }
}
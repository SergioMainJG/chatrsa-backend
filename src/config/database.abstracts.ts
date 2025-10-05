import { Result } from "../utils/patterns/result.pattern.ts";

type UserTemplate = {name: string, password:string};

export abstract class AbsDatabase {
  abstract createDatabase(): void;
  abstract createUserTable(): void;
  abstract createMessagesTable(): void;
  abstract addForeignKey(): void;
  abstract createUser(user: UserTemplate): Promise<Result<number | bigint>>;
  abstract getUserById(id:number): Promise<Result<Record<string, string>>>;
  abstract deleteUser(id:number): Promise<Result<boolean>>;
  abstract addMessageOfUser(content: string, userId: number): Promise<Result<number|bigint>>;
  abstract getMessagesByUserId(id: number): Promise<Result<Array<string>>>;
}
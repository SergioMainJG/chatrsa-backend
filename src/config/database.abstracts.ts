import { Result } from "../utils/patterns/result.pattern.ts";

export abstract class AbsDatabase {
  abstract createDatabase(): void;
  abstract createUserTable(): void;
  abstract createMessagesTable(): void;
  abstract addForeignKey(): void;
  abstract createUser(): Result<number | bigint>;
  abstract getUserById(): Result<Record<string, string>>;
  abstract deleteUser(): Result<boolean>;
  abstract getMessagesByUserId(): Result<Array<string>>;
}
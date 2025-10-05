import { DatabaseSync } from "node:sqlite";
import { Result } from "../utils/patterns/result.pattern.ts";
import { AbsDatabase } from "./database.abstracts.ts";

export class SQLiteService implements AbsDatabase{
  private static instanceSQLite: SQLiteService;
  private static name = `char-rsa`;
  private static database: DatabaseSync;

  public static getInstance(): SQLiteService {
    if (!SQLiteService.instanceSQLite) SQLiteService.instanceSQLite = new SQLiteService();
    return SQLiteService.instanceSQLite;
  }

  private constructor() {
    this.createDatabase();
    this.createUserTable();
    this.createMessagesTable();
    this.addForeignKey();
  }
  private createDatabase() {
    if (!SQLiteService.database)
      SQLiteService.database = new DatabaseSync(SQLiteService.name);
  }
  private createUserTable() {
    SQLiteService.database.exec(`
      CREATE TABLE IF NOT EXISTS User(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )  
    `);
  }
  private createMessagesTable() {
    SQLiteService.database.exec(`
      CREATE TABLE IF NOT EXISTS Messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner INTEGER NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (owner) REFERENCES User(id) ON DELETE CASCADE
      );
    `);
  }
  private addForeignKey() {
    SQLiteService.database.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_owner ON Messages(owner)
      `);
  }
  public createUser(user: { name: string, password: string }) {
    return Result.try(
      () => {
        const statement = SQLiteService
        .database
        .prepare(`
          Insert Into User (username, password) VALUES (?,?)
          `);
        return statement
        .run(user.name, user.password)
        .lastInsertRowid;
      }
    );
  }
  public getUserById(id: number) {
    return Result.try(
      () => {
        const statement = SQLiteService
        .database
        .prepare('select id, username, password from User where id=?');
        return statement.get(id);
      }
    );
  }
  public deleteUser(id: number) {
    return Result.try(
      () => {
        const statement = SQLiteService
        .database
        .prepare('delete from User where id=?');
        return statement.run(id)
      }
    );
  }
  public getMessagesByUserId(id: number) {
    return Result.try(
      () => {
        const statement = SQLiteService
        .database
        .prepare('select id, owner, content from messages where owner=?');
        return statement.run(id)
      }
    );
  }
  public addMessageOfUser(content: string, userId: number){
    return Result.try(
      ()=>{
        const statement = SQLiteService
        .database
        .prepare('Insert Into Messages (owner, content) values (?,?)');
        return statement.run(userId,content)
        .lastInsertRowid
      }
    );
  }
}
import { DatabaseSync } from "node:sqlite";
import { type User } from "../models/user.ts";

export class SQLiteService {
  private static instanceSQLite: SQLiteService;
  private static name = `char-rsa`;
  private static database: DatabaseSync;

  public static getInstance() {
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
    if(!SQLiteService.database)
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
  public createUser(user: User) { }
  public deleteUser() { }
  public getUserById() { }
  public getMessagesByUser() { }
}
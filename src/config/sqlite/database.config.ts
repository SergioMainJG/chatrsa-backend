import { DatabaseSync } from "node:sqlite";
import GLOBAL_CONFIG from "../env/get.env.ts";

const { database } = GLOBAL_CONFIG;
const { nameDatabase, pathDatabase, tableMessage, tableUser } = database;

export class SQLiteService {
  private static instanceSQLite: SQLiteService;
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
      SQLiteService.database = new DatabaseSync(pathDatabase + nameDatabase);
  }
  private createUserTable() {
    SQLiteService.database.exec(`
      CREATE TABLE IF NOT EXISTS ${tableUser}(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )  
    `);
  }
  private createMessagesTable() {
    SQLiteService.database.exec(`
      CREATE TABLE IF NOT EXISTS ${tableMessage} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES ${tableUser}(id) ON DELETE CASCADE
      );
    `);
  }
  private addForeignKey() {
    SQLiteService.database.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_userId ON ${tableUser}(owner)
      `);
  }
}
import { DatabaseSync } from "node:sqlite";
import GLOBAL_CONFIG from "../env/get.env.ts";

const { database } = GLOBAL_CONFIG;
const { nameDatabase, pathDatabase, tableMessage, tableUser } = database;

export class SQLiteDatabase {
  private static instanceSQLite: SQLiteDatabase;
  public static database: DatabaseSync;

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instanceSQLite) SQLiteDatabase.instanceSQLite = new SQLiteDatabase();
    return SQLiteDatabase.instanceSQLite;
  }
  private constructor() {
    this.createDatabase();
    this.enableWalMode();
    this.enableForeignKeys();
    this.createUserTable();
    this.createMessagesTable();
    this.createMessageIndex(); 
  }

  public getDb(): DatabaseSync {
    return SQLiteDatabase.database;
  }

  private enableWalMode() {
    SQLiteDatabase.database.exec("PRAGMA journal_mode = WAL;");
  }

  private enableForeignKeys() {
    SQLiteDatabase.database.exec("PRAGMA foreign_keys = ON;");
  }

  private createDatabase() {
    if (!SQLiteDatabase.database)
      SQLiteDatabase.database = new DatabaseSync(pathDatabase + nameDatabase);
  }
  private createUserTable() {
    SQLiteDatabase.database.exec(`
      CREATE TABLE IF NOT EXISTS ${tableUser}(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )  
    `);
  }
  private createMessagesTable() {
    SQLiteDatabase.database.exec(`
      CREATE TABLE IF NOT EXISTS ${tableMessage} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderUserId INTEGER NOT NULL,
        receiverUserId INTEGER NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (senderUserId) REFERENCES ${tableUser}(id) ON DELETE CASCADE,
        FOREIGN KEY (receiverUserId) REFERENCES ${tableUser}(id) ON DELETE CASCADE
      );
    `);
  }
  private createMessageIndex() {
    SQLiteDatabase.database.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_senderId ON ${tableMessage}(senderUserId)
    `);
    SQLiteDatabase.database.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_receiverId ON ${tableMessage}(receiverUserId)
    `);
  }
  public closeDatabase() {
    if (SQLiteDatabase.database && SQLiteDatabase.database.isOpen) {
      SQLiteDatabase.database.close();
    }
  }
}

export const dbInstance = SQLiteDatabase.getInstance().getDb();
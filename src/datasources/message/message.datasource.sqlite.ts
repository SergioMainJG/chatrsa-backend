import { StatementSync } from "node:sqlite";
import { dbInstance } from "../../config/sqlite/database.config.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import GLOBAL_CONFIG from "../../config/env/get.env.ts";
import { type MessageDatasource } from "./message.datasource.ts";
import { Messages } from "../../models/messages.ts";

const isMessage = (obj: any): obj is Messages => {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.userId === "number" &&
    typeof obj.content === "string"
  )
}

export class MessageDatasourceSQLite implements MessageDatasource {

  private readonly findByUserIdStatement: StatementSync;
  private readonly findMessagesForUserStatement: StatementSync;
  private readonly addMessageOfUserStatement: StatementSync;

  constructor() {
    this.findByUserIdStatement = dbInstance.prepare(
      `SELECT * FROM ${GLOBAL_CONFIG.database.tableMessage} WHERE userId = :userId ORDER BY id DESC`
    );
    this.findMessagesForUserStatement = dbInstance.prepare(
      `SELECT * FROM ${GLOBAL_CONFIG.database.tableMessage} 
       WHERE json_extract(content, '$.to') = :recipientId 
       ORDER BY id DESC`
    );
    this.addMessageOfUserStatement = dbInstance.prepare(
      `INSERT INTO ${GLOBAL_CONFIG.database.tableMessage} (userId, content) 
       VALUES (:userId, :content) 
       RETURNING *`
    );
  }
  getMessagesByUserId(userId: number): Promise<Result<Messages[], Error>> {
    return Result.try(
      () => {
        const messages = this.findByUserIdStatement.all({ ":userId": userId });
        const isNotValidMessages = messages.some(message => !isMessage(message));
        if (isNotValidMessages) return [] as Messages[];
        return messages as unknown as Messages[];
      }
    );
  }
  getMessagesForUser(recipientId: number): Promise<Result<Messages[], Error>> {
    return Result.try(
      () => {
        const messages = this.findMessagesForUserStatement.all({ 
          ":recipientId": recipientId 
        });
        const isNotValidMessages = messages.some(message => !isMessage(message));
        if (isNotValidMessages) return [] as Messages[];
        return messages as unknown as Messages[];
      }
    );
  }
  addMessageOfUser(userId: number, content: string): Promise<Result<Messages, Error>> {
    return Result.try(
      () => {
        const message = this.addMessageOfUserStatement.get({
          ":userId": userId,
          ":content": content,
        });
        if (!isMessage(message)) {
          throw new Error(`Failed to save message for user ${userId}`);
        }
        return message;
      }
    )
  }
}
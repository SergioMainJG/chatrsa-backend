import { StatementSync } from "node:sqlite";
import { dbInstance } from "../../config/sqlite/database.sqlite.config.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import GLOBAL_CONFIG from "../../config/env/get.env.ts";
import { type MessageDatasource } from "./message.datasource.ts";
import { Messages } from "../../models/messages.ts";

const isMessage = (obj: any): obj is Messages => {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.senderUserId === "number" &&
    typeof obj.receiverUserId === "number" &&
    typeof obj.content === "string"
  )
}

export class MessageDatasourceSQLite implements MessageDatasource {

  private readonly findByUserIdStatement: StatementSync;
  private readonly addMessageOfUserStatement: StatementSync;

  constructor() {
    this.findByUserIdStatement = dbInstance.prepare(
      `SELECT * FROM ${GLOBAL_CONFIG.database.tableMessage}
      WHERE senderUserId = :senderUserId OR receiverUserId = :receiverUserId ORDER BY id DESC`
    );
    this.addMessageOfUserStatement = dbInstance.prepare(
      `INSERT INTO ${GLOBAL_CONFIG.database.tableMessage} (senderUserId, receiverUserId, content) 
       VALUES (:senderUserId, :receiverUserId, :content) 
       RETURNING *`
    );
  }
  getMessagesByUserId(senderUserId: number): Promise<Result<Messages[], Error>> {
    return Result.try(
      () => {
        const messages = this.findByUserIdStatement.all({
          ":senderUserId": senderUserId,
          ":receiverUserId": senderUserId
        });
        const isNotValidMessages = messages.some(message => !isMessage(message));
        if (isNotValidMessages) return [] as Messages[];
        return messages as unknown as Messages[];
      }
    );
  }
  addMessageOfUser(senderUserId: number, receiverUserId: number, content: string): Promise<Result<Messages, Error>> {
    return Result.try(
      () => {
        const message = this.addMessageOfUserStatement.get({
          ":receiverUserId": receiverUserId,
          ":senderUserId": senderUserId,
          ":content": content,
        });
        if (!isMessage(message)) {
          throw new Error(`Failed to save message of ${senderUserId} to ${receiverUserId}`);
        }
        return message;
      }
    )
  }
}
import { type MessageRepository } from "./message.repository.ts";
import { type MessageDatasource } from "../../datasources/message/message.datasource.ts";
import { type Messages } from "../../models/messages.ts";
import { type Result } from "../../utils/patterns/result.pattern.ts";

export class MessageRepositoryImpl implements MessageRepository {
  constructor(
    private readonly datasource: MessageDatasource
  ) { }
  getMessagesByUserId(message: { userId: number; }): Promise<Result<Messages[], Error>> {
    return this.datasource.getMessagesByUserId(message.userId);
  }
  getMessagesForUser(message: { recipientId: number; }): Promise<Result<Messages[], Error>> {
    return this.datasource.getMessagesForUser(message.recipientId);
  }
  addMessageOfUser(message: { userId: number; content: string; }): Promise<Result<Messages, Error>> {
    return this.datasource.addMessageOfUser(message.userId, message.content);
  }
}
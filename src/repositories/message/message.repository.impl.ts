import { MessageRepository } from "./message.repository.ts";
import { MessageDatasource } from "../../datasources/message/message.datasource.ts";
import { Messages } from "../../models/messages.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export class MessageRepositoryImpl implements MessageRepository {
  constructor(
    private readonly datasource: MessageDatasource
  ) { }
  getMessagesByUserId(message: { userId: number; }): Promise<Result<Messages[], Error>> {
    return this.datasource.getMessagesByUserId(message.userId);
  }
  addMessageOfUser(message: { userId: number; content: string; }): Promise<Result<Messages, Error>> {
    return this.datasource.addMessageOfUser(message.userId, message.content);
  }
}

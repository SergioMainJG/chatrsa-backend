import { type Messages } from "../../models/messages.ts";
import { type Result } from "../../utils/patterns/result.pattern.ts";

export abstract class MessageDatasource {
  abstract getMessagesByUserId(
    userId: number,
  ): Promise<Result<Messages[], Error>>;
  abstract addMessageOfUser(
    senderUserId: number,
    receiverUserId: number,
    content: string
  ): Promise<Result<Messages, Error>>;
}
import { type Messages } from "../../models/messages.ts";
import { type Result } from "../../utils/patterns/result.pattern.ts";

export abstract class MessageRepository {
  abstract getMessagesByUserId(
    message: { userId: number },
  ): Promise<Result<Messages[], Error>>;
  abstract addMessageOfUser(
    message: { senderUserId: number, receiverUserId: number; content: string },
  ): Promise<Result<Messages, Error>>;
}
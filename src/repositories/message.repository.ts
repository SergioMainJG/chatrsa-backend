import { type Messages } from "../models/messages.ts";
import { type Result } from "../utils/patterns/result.pattern.ts";

export abstract class MessageRepository {
  abstract getMessagesByUserId(
    owner: number,
  ): Promise<Result<Messages[], Error>>;
  abstract addMessageOfUser(
    message: { owner: number; content: string },
  ): Promise<Result<Messages, Error>>;
}

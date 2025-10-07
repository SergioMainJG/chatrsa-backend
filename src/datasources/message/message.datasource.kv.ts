import { kvInstance } from "../../config/deno-kv/database.kv.config.ts";
import { Messages } from "../../models/messages.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { MessageDatasource } from "./message.datasource.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";

const isMessage = (obj: any): obj is Messages => {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.senderUserId === "number" &&
    typeof obj.receiverUserId === "number" &&
    typeof obj.content === "string"
  );
};

const kv = await kvInstance;

export class MessageDatasourceKV implements MessageDatasource {
  async addMessageOfUser(senderUserId: number, receiverUserId: number, content: string): Promise<Result<Messages, Error>> {
    try {
      const id = Date.now();
      const messageResult = Messages.create({ id, senderUserId, receiverUserId, content });
      if (!messageResult.isSuccess) return messageResult;
      const message = messageResult.value!;
      const result = await kv.atomic()
        .set(["messages", id], message)
        .set(["messages_by_user", senderUserId, id], message)
        .set(["messages_for_user", receiverUserId, id], message)
        .commit();
      if (!result.ok) throw new Error('Failed to save message');

      return Result.Success(message);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return Result.Failure(CustomError.badRequest('Message content is not valid JSON'));
      }
      return Result.Failure(error as Error);
    }
  }
  async getMessagesByUserId(userId: number): Promise<Result<Messages[], Error>> {
    try {
      const sentPromise = kv.list<Messages>({ prefix: ["messages_by_user", userId] });
      const receivedPromise = kv.list<Messages>({ prefix: ["messages_for_user", userId] });
      const [sentEntries, receivedEntries] = await Promise.all([sentPromise, receivedPromise]);
      const messagesMap = new Map<number, Messages>();
      for await (const entry of sentEntries) {
        if (isMessage(entry.value)) {
          messagesMap.set(entry.value.id, entry.value);
        }
      }
      for await (const entry of receivedEntries) {
        if (isMessage(entry.value)) {
          messagesMap.set(entry.value.id, entry.value);
        }
      }
      const allMessages = Array.from(messagesMap.values());
      allMessages.sort((a, b) => a.id - b.id);
      return Result.Success(allMessages);
    } catch (error) {
      return Result.Failure(error as Error);
    }
  }
}
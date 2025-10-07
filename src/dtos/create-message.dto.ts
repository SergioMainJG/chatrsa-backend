import { Result } from '../utils/patterns/result.pattern.ts';

export class CreateMessageDto {
  private constructor(
    public readonly senderUserId: number,
    public readonly receiverUserId: number,
    public readonly content: string
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<CreateMessageDto, Error> {
    const { senderUserId, receiverUserId, content } = props;
    if (!senderUserId)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The senderUserId must exist`));
    if (typeof senderUserId !== "number")
      return Result.Failure<CreateMessageDto, Error>(new Error(`The senderUserId must be a number`));
    if (senderUserId <= 0)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The senderUserId must be a positive number`));
    if (!Number.isSafeInteger(senderUserId))
      return Result.Failure<CreateMessageDto, Error>(new Error(`The senderUserId must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));

    if (!receiverUserId)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The receiverUserId must exist`));
    if (typeof receiverUserId !== "number")
      return Result.Failure<CreateMessageDto, Error>(new Error(`The receiverUserId must be a number`));
    if (receiverUserId <= 0)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The receiverUserId must be a positive number`));
    if (!Number.isSafeInteger(receiverUserId))
      return Result.Failure<CreateMessageDto, Error>(new Error(`The receiverUserId must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));

    if (!content)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The content must exist`));
    if (typeof content !== "string")
      return Result.Failure<CreateMessageDto, Error>(new Error(`The content must be a string`));
    if (content.trim().length === 0)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The content must don't be a void string`));

    return Result.Success(new CreateMessageDto(senderUserId, receiverUserId, content));
  }
}
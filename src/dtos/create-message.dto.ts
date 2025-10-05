import { Result } from '../utils/patterns/result.pattern.ts';

export class CreateMessageDto {
  private constructor(
    public readonly owner: number,
    public readonly content: string
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<CreateMessageDto, Error> {
    const { owner, content } = props;
    if (!owner)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The owner must exist`));
    if (typeof owner !== "number")
      return Result.Failure<CreateMessageDto, Error>(new Error(`The owner must be a number`));
    if (owner <= 0)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The owner must be a positive number`));
    if (!Number.isSafeInteger(owner))
      return Result.Failure<CreateMessageDto, Error>(new Error(`The owner must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));

    if (!content)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The content must exist`));
    if (typeof content !== "string")
      return Result.Failure<CreateMessageDto, Error>(new Error(`The content must be a string`));
    if (content.trim().length === 0)
      return Result.Failure<CreateMessageDto, Error>(new Error(`The content must don't be a void string`));

    return Result.Success(new CreateMessageDto(owner, content));
  }
}
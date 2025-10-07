import { Result } from '../utils/patterns/result.pattern.ts';

export class GetMessageDto {
  private constructor(
    public readonly userId: number
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<GetMessageDto, Error> {
    const { userId } = props;
    if (!userId)
      return Result.Failure<GetMessageDto, Error>(new Error(`The userId must exist`));
    if (typeof userId !== "number")
      return Result.Failure<GetMessageDto, Error>(new Error(`The userId must be a number`));
    if (userId <= 0)
      return Result.Failure<GetMessageDto, Error>(new Error(`The userId must be a positive number`));
    if (!Number.isSafeInteger(userId))
      return Result.Failure<GetMessageDto, Error>(new Error(`The userId must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));

    return Result.Success(new GetMessageDto(userId));
  }
}
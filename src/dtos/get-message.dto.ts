import { Result } from '../utils/patterns/result.pattern.ts';

export class GetMessageDto {
  private constructor(
    public readonly owner: number
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<GetMessageDto, Error> {
    const { owner } = props;
    if (!owner)
      return Result.Failure<GetMessageDto, Error>(new Error(`The owner must exist`));
    if (typeof owner !== "number")
      return Result.Failure<GetMessageDto, Error>(new Error(`The owner must be a number`));
    if (owner <= 0)
      return Result.Failure<GetMessageDto, Error>(new Error(`The owner must be a positive number`));
    if (!Number.isSafeInteger(owner))
      return Result.Failure<GetMessageDto, Error>(new Error(`The owner must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));

    return Result.Success(new GetMessageDto(owner));
  }
}
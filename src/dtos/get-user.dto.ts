import { Result } from '../utils/patterns/result.pattern.ts';

export class GetUserDto {
  private constructor(
    public readonly id: number
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<GetUserDto, Error> {
    const { id } = props;
    if (!id)
      return Result.Failure<GetUserDto, Error>(new Error(`The id must exist`));
    if (typeof id !== "number")
      return Result.Failure<GetUserDto, Error>(new Error(`The id must be a number`));
    if (id <= 0)
      return Result.Failure<GetUserDto, Error>(new Error(`The id must be a positive number`));
    if (!Number.isSafeInteger(id))
      return Result.Failure<GetUserDto, Error>(new Error(`The id must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));

    return Result.Success(new GetUserDto(id));
  }
}
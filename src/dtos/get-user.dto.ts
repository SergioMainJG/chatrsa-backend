import { Result } from '../utils/patterns/result.pattern.ts';

export class GetUserDto {
  private constructor(
    public readonly name: string,
    public readonly password: string,
    public readonly id?: number,
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<GetUserDto, Error> {
    const { id, name, password } = props;
    
    // Validar id solo si se proporciona
    if (id !== undefined) {
      if (typeof id !== "number")
        return Result.Failure<GetUserDto, Error>(new Error(`The id must be a number`));
      if (id <= 0)
        return Result.Failure<GetUserDto, Error>(new Error(`The id must be a positive number`));
      if (!Number.isSafeInteger(id))
        return Result.Failure<GetUserDto, Error>(new Error(`The id must be a safe integer (review: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger")`));
    }

    if (!name)
      return Result.Failure<GetUserDto, Error>(new Error(`The name must exist`));
    if (typeof name !== "string")
      return Result.Failure<GetUserDto, Error>(new Error(`The name must be a string`));
    if (name.trim().length === 0)
      return Result.Failure<GetUserDto, Error>(new Error(`The name must don't be a void string`));

    if (!password)
      return Result.Failure<GetUserDto, Error>(new Error(`The password must exist`));
    if (typeof password !== "string")
      return Result.Failure<GetUserDto, Error>(new Error(`The password must be a string`));
    if (password.trim().length === 0)
      return Result.Failure<GetUserDto, Error>(new Error(`The password must don't be a void string`));

    return Result.Success(new GetUserDto(name, password, id));
  }
}

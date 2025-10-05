import { Result } from '../utils/patterns/result.pattern.ts';

export class CreateUserDto {
  private constructor(
    public readonly name: string,
    public readonly password: string
  ) { }

  static create(
    props: { [key: string]: any }
  ): Result<CreateUserDto, Error> {
    const { name, password } = props;
    if (!name)
      return Result.Failure<CreateUserDto, Error>(new Error(`The name must exist`));
    if (typeof name !== "string")
      return Result.Failure<CreateUserDto, Error>(new Error(`The name must be a string`));
    if (name.trim().length === 0)
      return Result.Failure<CreateUserDto, Error>(new Error(`The name must don't be a void string`));

    if (!password)
      return Result.Failure<CreateUserDto, Error>(new Error(`The password must exist`));
    if (typeof password !== "string")
      return Result.Failure<CreateUserDto, Error>(new Error(`The password must be a string`));
    if (password.trim().length === 0)
      return Result.Failure<CreateUserDto, Error>(new Error(`The password must don't be a void string`));

    return Result.Success(new CreateUserDto(name, password));
  }
}
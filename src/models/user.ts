import { Result } from "../utils/patterns/result.pattern.ts";

interface UserProps {
  id: number;
  name: string;
  password: string;
}

export class User {
  private static validateId = (id: number) => {
    if (Number.isNaN(id))
      return Result.Failure<number, Error>(new Error(`It's not a valid id for the user, 'NaN' can't be the id`));
    if (!Number.isInteger(id))
      return Result.Failure<number, Error>(new Error(`It's not a valid id for the user, that must be an integer`));
    if (id < 1)
      return Result.Failure<number, Error>(new Error(`It's not a valid id for the user, the id must be a positive integer`));
    return Result.Success<number, Error>(id);
  }
  private static validateName = (name: string) => {
    if (typeof name !== 'string')
      return Result.Failure<string, Error>(new Error(`The name must be an string`));
    return Result.Success<string, Error>(name);
  }
  private static validatePassword = (password: string) => {
    if (typeof password !== 'string')
      return Result.Failure<string, Error>(new Error(`The password must be an string`));
    return Result.Success<string, Error>(password);
  }
  public static create(
    { id, name, password }: UserProps
  ):Result<User, Error> {
    let isValidProps = true;
    const errors: Array<string> = [];
    const resultId = User.validateId(id);
    if (!resultId.isSuccess){
      isValidProps = false;
      errors.push(resultId.error?.message as string);
    }
    const resultName = User.validateName(name);
    if (!resultName.isSuccess){
      isValidProps = false;
      errors.push(resultName.error?.message as string);
    }
    const resultPassword = User.validatePassword(password);
    if (!resultPassword.isSuccess) {
      isValidProps = false;
      errors.push(resultPassword.error?.message as string);
    }
    return isValidProps
      ? Result.Success<User, Error>(new User(id, name, password))
      : Result.Failure<User, Error>(new Error(errors.join("\n")));
  }
  private constructor(
    private readonly _id: number,
    private readonly _name: string,
    private readonly _password: string
  ) { }
  get id() { return this._id }
  get name() { return this._name; }
  get password() { return this._password }
}


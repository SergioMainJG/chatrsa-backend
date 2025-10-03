import { Result } from "../utils/patterns/result.pattern.ts";

interface MessagesProps {
  id: number;
  owner: number;
  content: string;
}

export class Messages {
  private static validateId = (id: number) => {
    if (Number.isNaN(id))
      return Result.Failure<number, Error>(new Error(`It's not a valid id for the user, 'NaN' can't be the id`));
    if (!Number.isInteger(id))
      return Result.Failure<number, Error>(new Error(`It's not a valid id for the user, that must be an integer`));
    if (id < 1)
      return Result.Failure<number, Error>(new Error(`It's not a valid id for the user, the id must be a positive integer`));
    return Result.Success<number, Error>(id);
  }
  private static validateMessage = (password: string) => {
    if (typeof password !== 'string')
      return Result.Failure<string, Error>(new Error(`The password must be an string`));
    return Result.Success<string, Error>(password);
  }
  public static create(
    { id, owner, content}: MessagesProps
  ):Result<Messages, Error> {
    let isValidProps = false;
    const errors: Array<string> = [];
    const resultId = Messages.validateId(id);
    if (!resultId.isSuccess){
      isValidProps = false;
      errors.push(resultId.error?.message as string);
    }
    const resultName = Messages.validateMessage(content);
    if (!resultName.isSuccess){
      isValidProps = false;
      errors.push(resultName.error?.message as string);
    }
    const resultOwner = Messages.validateId(owner);
    if (!resultOwner.isSuccess) {
      isValidProps = false;
      errors.push(resultOwner.error?.message as string);
    }
    return isValidProps
      ? Result.Success<Messages, Error>(new Messages(id, name, content))
      : Result.Failure<Messages, Error>(new Error(errors.join("\n")));
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


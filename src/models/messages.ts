import { Result } from "../utils/patterns/result.pattern.ts";

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
  private static validateContent = (content: string) => {
    if (typeof content !== 'string')
      return Result.Failure<string, Error>(new Error(`The password must be an string`));
    return Result.Success<string, Error>(content);
  }
  public static create(
    { id, senderUserId, receiverUserId, content}: MessagesProps
  ):Result<Messages, Error> {
    let isValidProps = true;
    const errors: Array<string> = [];
    const resultId = Messages.validateId(id);
    if (!resultId.isSuccess){
      isValidProps = false;
      errors.push(resultId.error?.message as string);
    }
    const resultName = Messages.validateContent(content);
    if (!resultName.isSuccess){
      isValidProps = false;
      errors.push(resultName.error?.message as string);
    }
    const resultSender = Messages.validateId(senderUserId);
    if (!resultSender.isSuccess) {
      isValidProps = false;
      errors.push(resultSender.error?.message as string);
    }
    
    const resultReceiver = Messages.validateId(receiverUserId);
    if (!resultReceiver.isSuccess) {
      isValidProps = false;
      errors.push(resultReceiver.error?.message as string);
    }
    return isValidProps
      ? Result.Success<Messages, Error>(new Messages(id, senderUserId, receiverUserId, content))
      : Result.Failure<Messages, Error>(new Error(errors.join("\n")));
  }

  private constructor(
    private readonly _id: number,
    private readonly _senderUserId: number,
    private readonly _receiverUserId: number,
    private readonly _content: string
  ) { }

  get id() { return this._id }
  get senderUserId() { return this._senderUserId; }
  get receiverUserId() { return this._receiverUserId; }
  get content() { return this._content }
}


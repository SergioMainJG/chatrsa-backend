export class Result<T, E extends Error = Error> {

  public static Success<T, E extends Error = Error>(
    value: T ): Result<T, E> {
    return new Result<T, E>(true, value, null);
  }

  public static Failure<T, E extends Error = Error>(
    error: E
  ):Result<T, E> {
    return new Result<T,E>(false, null, error);
  }

  public static async try<T>(
    callback: () => T | Promise<T>
  ):Promise<Result<T, Error>> {
    try {
      const result = await callback();
      return Result.Success(result);
    } catch (error) {
      if (error instanceof Error) {
        return Result.Failure(error);
      }
      return Result.Failure(new Error(String(error)));
    }
  }

  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value: T | null,
    private readonly _error: null | E,
  ) { }

  get isSuccess(){return this._isSuccess};
  get value(){return this._value};
  get error(){return this._error};
}
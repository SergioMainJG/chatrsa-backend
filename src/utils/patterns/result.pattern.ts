export class Result<T> {

  public static Success<T>(value: T) {
    return new Result<T>(true, value, null);
  }

  public static Failure<T>(error: string) {
    return new Result<T>(false, null, error);
  }

  public static HardProcess<T>(
    callback: () => T,
    awaitedError: string
  ) {
    try {
      const result = callback();
      return Result.Success(result);
    } catch (_error) {
      return Result.Failure(awaitedError);
    }
  }

  private constructor(
    private readonly isSuccess: boolean,
    private readonly value: T | null,
    private readonly error: null | string,
  ) { }

}
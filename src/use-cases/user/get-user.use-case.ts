import { Encrypter } from "../../config/encrypter/argon2.adapter.ts";
import { GetUserDto } from "../../dtos/get-user.dto.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";

export interface GetUserUseCase {
  execute(getUserDto: GetUserDto): Promise<Result<User, Error>>
}

export class GetUser implements GetUserUseCase {

  constructor(
    private readonly repositories: UserRepository[]
  ) { }

  private async getUserFromRepositories(
    user: { name: string }    
  ): Promise<Result<User, Error>[]> {
    const promisesQueries = this.repositories.map((repository) => repository.getUserByName(user));
    return await Promise.all(promisesQueries);
  }

  async execute(getUserDto: GetUserDto): Promise<Result<User, Error>> {
    const queriesResults = (await this.getUserFromRepositories({name: getUserDto.name}))
    const successfulResult = queriesResults.find(result => result.isSuccess);
    if (
      !successfulResult ||
      !successfulResult.value
    ) {
      return Result.Failure<User, Error>(CustomError.unauthorized(`Invalid credentials`));
    }
    const user = successfulResult.value;
    const arePasswordsEquals = await Encrypter.compare(
      user.password as string,
      getUserDto.password);
    if (!arePasswordsEquals) {
      return Result.Failure(CustomError.unauthorized(`Invalid credentials, password is wrong`));
    }
    return Result.Success<User, Error>(user);
  }
}
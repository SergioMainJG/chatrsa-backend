import { Encrypter } from "../../config/encrypter/argon2.adapter.ts";
import { GetUserDto } from "../../dtos/get-user.dto.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export interface GetUserUseCase {
  execute(getUserDto: GetUserDto): Promise<Result<User, Error>>
}

export class CreateUser implements GetUserUseCase {

  constructor(
    private readonly repository: UserRepository
  ) { }

  async execute(getUserDto: GetUserDto): Promise<Result<User, Error>> {
    const areCredentialsValid = true;
    const message: string[] = [];
    const { isSuccess, error, value } = await this.repository.getUserById(getUserDto);
    if (!isSuccess) return Result.Failure(error as Error);
    const areNamesEquals = Encrypter.compare(getUserDto.name, value?.name as string);
    if (!areNamesEquals) message.push(`Name is not matching`);
    const arePasswordsEquals = Encrypter.compare(getUserDto.password, value?.password as string);
    if (!arePasswordsEquals) message.push(`Password is not equals`);

    return areCredentialsValid
      ? this.repository.getUserById(getUserDto)
      : Result.Failure(new Error(message.join("\n")));
  }
}
import { CreateUserDto } from "../../dtos/create-user.dto.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";
import { Encrypter } from "../../config/encrypter/argon2.adapter.ts";
import { CustomError } from "../../utils/errors/custom-error.ts";

export interface CreateUserUseCase {
  execute(dto: CreateUserDto): Promise<Result<User, Error>>
}

export class CreateUser implements CreateUserUseCase {

  constructor(
    private readonly repository: UserRepository
  ) { }

  async execute(createUserDto: CreateUserDto): Promise<Result<User, Error>> {
    const { isSuccess: isAlreadyCreated} = await this.repository.getUserByName({ name: createUserDto.name });
    if (isAlreadyCreated) {
      return Result.Failure(CustomError.badRequest(`User with name "${createUserDto.name}" already exists`));
    }
    
    const name = createUserDto.name;
    const password = await Encrypter.hash(createUserDto.password);
    const { value, error, isSuccess } = await this.repository.createUser({ name, password });
    
    if (!isSuccess) return Result.Failure<User, Error>(error as Error);
    return Result.Success(value as User);
  }
}
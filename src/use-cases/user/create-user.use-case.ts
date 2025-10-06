import { CreateUserDto } from "../../dtos/create-user.dto.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";
import { Encrypter } from "../../config/encrypter/argon2.adapter.ts";

export interface CreateUserUseCase {
  execute(dto: CreateUserDto): Promise<Result<User, Error>>
}

export class CreateUser implements CreateUserUseCase {

  constructor(
    private readonly repository: UserRepository
  ) { }

  async execute(createUserDto: CreateUserDto): Promise<Result<User, Error>> {
    const { isSuccess: isAlreadyCreated, error: creationError} = await this.repository.getUserByName({ name: createUserDto.name });
    if (isAlreadyCreated) return Result.Failure(creationError as Error);
    
    const name = await Encrypter.hash(createUserDto.name);
    const password = await Encrypter.hash(createUserDto.password);
    const { value, error, isSuccess } = await this.repository.createUser({ name, password });
    
    if (!isSuccess) return Result.Failure<User, Error>(error as Error);
    return this.repository.createUser(value as User);
  }
}
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
    private readonly repositories: UserRepository[]
  ) { }

  private async getUserFromRepositories(
    user: { name: string }    
  ): Promise<Result<User, Error>[]> {
    const promisesQueries = this.repositories.map((repository) => repository.getUserByName(user));
    return await Promise.all(promisesQueries);
  }
  
  private async createUserIntoRepositories(
    user: { name: string, password: string}
  ): Promise<Result<User, Error>[]> {
    const promisesQueries = this.repositories.map( (repository) => repository.createUser(user));
    return await Promise.all(promisesQueries);
  }

  async execute(createUserDto: CreateUserDto): Promise<Result<User, Error>> {
    const isAlreadyCreated = (await this.getUserFromRepositories({name: createUserDto.name}))
      .some( result => result.isSuccess ); 
    if (isAlreadyCreated) {
      return Result.Failure(CustomError.badRequest(`User with name "${createUserDto.name}" already exists`));
    }

    const name = createUserDto.name;
    const password = await Encrypter.hash(createUserDto.password);
    const resultsQueries = await this.createUserIntoRepositories({name, password});
    const anySuccess = resultsQueries.find( result => result.isSuccess );

    if(anySuccess && anySuccess.value ) return Result.Success(anySuccess.value);
    const error = resultsQueries.find(result => !result.isSuccess)?.error;
      return Result.Failure<User, Error>(
        error ||
        CustomError.internalServer(`The user wasn't save correctly, contact the server to check the DB's status`)
      ); 
  }
}
import { CreateUserDto } from "../../dtos/create-user.dto.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";

export interface CreateUserUseCase{
  execute( dto: CreateUserDto ): Promise<Result<User, Error>>
}

export class CreateUser implements CreateUserUseCase{
  
  constructor(
    private readonly repository: UserRepository
  ){}

  execute(dto: CreateUserDto): Promise<Result<User, Error>> {
    return this.repository.createUser(dto);
  }
}
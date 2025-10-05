import { GetUserDto } from "../../dtos/get-user.dto.ts";
import { User } from "../../models/user.ts";
import { UserRepository } from "../../repositories/user/user.repository.ts";
import { Result } from "../../utils/patterns/result.pattern.ts";

export interface GetUserUseCase{
  execute( dto: GetUserDto ): Promise<Result<User, Error>>
}

export class CreateUser implements GetUserUseCase{
  
  constructor(
    private readonly repository: UserRepository
  ){}

  execute(dto: GetUserDto): Promise<Result<User, Error>> {
    return this.repository.getUserById(dto);
  }
}